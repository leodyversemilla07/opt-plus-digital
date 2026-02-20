<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to measurements table for better query performance
        Schema::table('measurements', function (Blueprint $table) {
            // Index for queries filtering by child_id
            $table->index('child_id', 'idx_measurements_child_id');

            // Index for queries filtering by measurement_date
            $table->index('measurement_date', 'idx_measurements_date');

            // Composite index for queries filtering by both child_id and measurement_date
            // Useful for fetching a child's measurements in date order
            $table->index(['child_id', 'measurement_date'], 'idx_measurements_child_date');

            // Index for measured_by_user_id (foreign key lookup)
            $table->index('measured_by_user_id', 'idx_measurements_measured_by');
        });

        // Add indexes to children table for better query performance
        Schema::table('children', function (Blueprint $table) {
            // Index for queries searching/sorting by last_name
            $table->index('last_name', 'idx_children_last_name');

            // Index for queries filtering by barangay_id
            $table->index('barangay_id', 'idx_children_barangay_id');

            // Composite index for barangay + last_name queries (common in BHW reports)
            $table->index(['barangay_id', 'last_name'], 'idx_children_barangay_lastname');

            // Index for date_of_birth (age calculations and age-based queries)
            $table->index('date_of_birth', 'idx_children_dob');

            // Index for family_serial_number (lookups and duplicate detection)
            $table->index('family_serial_number', 'idx_children_fsn');

            // Index for is_indigenous_people (filtering in reports)
            $table->index('is_indigenous_people', 'idx_children_indigenous');

            // Index for created_by_user_id (user's registered children queries)
            $table->index('created_by_user_id', 'idx_children_created_by');
        });

        // Add indexes to users table
        Schema::table('users', function (Blueprint $table) {
            // Index for email lookups (already unique, but explicit index helps)
            // Note: unique constraint already creates an index, but we document it here

            // Index for barangay_id if users are assigned to barangays
            if (Schema::hasColumn('users', 'barangay_id')) {
                $table->index('barangay_id', 'idx_users_barangay_id');
            }
        });

        // Add index to barangays table
        Schema::table('barangays', function (Blueprint $table) {
            // Index for name searches/sorting
            $table->index('name', 'idx_barangays_name');

            // Index for municipality/province filtering
            $table->index('municipality_city', 'idx_barangays_municipality');
            $table->index('province', 'idx_barangays_province');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from measurements table.
        // Use conditional checks to handle partial rollbacks gracefully.
        // The measured_by_user_id foreign key depends on idx_measurements_measured_by,
        // so we must drop the foreign key first, then the index, then restore the constraint.
        $measurementIndexNames = collect(Schema::getIndexes('measurements'))->pluck('name');

        Schema::table('measurements', function (Blueprint $table) use ($measurementIndexNames) {
            if ($measurementIndexNames->contains('idx_measurements_child_id')) {
                $table->dropIndex('idx_measurements_child_id');
            }
            if ($measurementIndexNames->contains('idx_measurements_date')) {
                $table->dropIndex('idx_measurements_date');
            }
            if ($measurementIndexNames->contains('idx_measurements_child_date')) {
                $table->dropIndex('idx_measurements_child_date');
            }
        });

        Schema::table('measurements', function (Blueprint $table) {
            if (collect(Schema::getForeignKeys('measurements'))->where('name', 'measurements_measured_by_user_id_foreign')->isNotEmpty()) {
                $table->dropForeign('measurements_measured_by_user_id_foreign');
            }
        });

        if (collect(Schema::getIndexes('measurements'))->pluck('name')->contains('idx_measurements_measured_by')) {
            Schema::table('measurements', fn (Blueprint $table) => $table->dropIndex('idx_measurements_measured_by'));
        }

        Schema::table('measurements', function (Blueprint $table) {
            $table->foreign('measured_by_user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // Drop indexes from children table.
        // idx_children_created_by supports a foreign key; drop FK first, then index, then restore.
        $childrenIndexNames = collect(Schema::getIndexes('children'))->pluck('name');

        Schema::table('children', function (Blueprint $table) use ($childrenIndexNames) {
            if ($childrenIndexNames->contains('idx_children_last_name')) {
                $table->dropIndex('idx_children_last_name');
            }
            if ($childrenIndexNames->contains('idx_children_barangay_id')) {
                $table->dropIndex('idx_children_barangay_id');
            }
            if ($childrenIndexNames->contains('idx_children_barangay_lastname')) {
                $table->dropIndex('idx_children_barangay_lastname');
            }
            if ($childrenIndexNames->contains('idx_children_dob')) {
                $table->dropIndex('idx_children_dob');
            }
            if ($childrenIndexNames->contains('idx_children_fsn')) {
                $table->dropIndex('idx_children_fsn');
            }
            if ($childrenIndexNames->contains('idx_children_indigenous')) {
                $table->dropIndex('idx_children_indigenous');
            }
        });

        Schema::table('children', function (Blueprint $table) {
            if (collect(Schema::getForeignKeys('children'))->where('name', 'children_created_by_user_id_foreign')->isNotEmpty()) {
                $table->dropForeign('children_created_by_user_id_foreign');
            }
        });

        if (collect(Schema::getIndexes('children'))->pluck('name')->contains('idx_children_created_by')) {
            Schema::table('children', fn (Blueprint $table) => $table->dropIndex('idx_children_created_by'));
        }

        Schema::table('children', function (Blueprint $table) {
            $table->foreign('created_by_user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // Drop indexes from users table.
        // idx_users_barangay_id supports a foreign key; drop FK first, then index, then restore.
        if (Schema::hasColumn('users', 'barangay_id')) {
            Schema::table('users', function (Blueprint $table) {
                if (collect(Schema::getForeignKeys('users'))->where('name', 'users_barangay_id_foreign')->isNotEmpty()) {
                    $table->dropForeign('users_barangay_id_foreign');
                }
            });

            if (collect(Schema::getIndexes('users'))->pluck('name')->contains('idx_users_barangay_id')) {
                Schema::table('users', fn (Blueprint $table) => $table->dropIndex('idx_users_barangay_id'));
            }

            Schema::table('users', function (Blueprint $table) {
                $table->foreign('barangay_id')->references('id')->on('barangays')->onDelete('set null');
            });
        }

        // Drop indexes from barangays table
        Schema::table('barangays', function (Blueprint $table) {
            $table->dropIndex('idx_barangays_name');
            $table->dropIndex('idx_barangays_municipality');
            $table->dropIndex('idx_barangays_province');
        });
    }
};
