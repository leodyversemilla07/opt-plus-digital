<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'Ang :attribute ay dapat tanggapin.',
    'accepted_if' => 'Ang :attribute ay dapat tanggapin kapag ang :other ay :value.',
    'active_url' => 'Ang :attribute ay hindi wastong URL.',
    'after' => 'Ang :attribute ay dapat na petsa pagkatapos ng :date.',
    'after_or_equal' => 'Ang :attribute ay dapat na petsa na pagkatapos o katumbas ng :date.',
    'alpha' => 'Ang :attribute ay dapat mga titik lamang.',
    'alpha_dash' => 'Ang :attribute ay dapat mga titik, numero, gitling, at underscore lamang.',
    'alpha_num' => 'Ang :attribute ay dapat mga titik at numero lamang.',
    'array' => 'Ang :attribute ay dapat isang array.',
    'ascii' => 'Ang :attribute ay dapat maglaman lamang ng single-byte alphanumeric characters at symbols.',
    'before' => 'Ang :attribute ay dapat na petsa bago ang :date.',
    'before_or_equal' => 'Ang :attribute ay dapat na petsa na bago o katumbas ng :date.',
    'between' => [
        'array' => 'Ang :attribute ay dapat may :min hanggang :max na mga item.',
        'file' => 'Ang :attribute ay dapat :min hanggang :max kilobytes.',
        'numeric' => 'Ang :attribute ay dapat nasa pagitan ng :min at :max.',
        'string' => 'Ang :attribute ay dapat :min hanggang :max na mga karakter.',
    ],
    'boolean' => 'Ang field na :attribute ay dapat totoo o hindi.',
    'can' => 'Ang :attribute ay naglalaman ng hindi awtorisadong halaga.',
    'confirmed' => 'Ang kumpirmasyon ng :attribute ay hindi tugma.',
    'contains' => 'Ang :attribute ay nawawala ang isang kinakailangang halaga.',
    'current_password' => 'Ang password ay mali.',
    'date' => 'Ang :attribute ay hindi wastong petsa.',
    'date_equals' => 'Ang :attribute ay dapat na petsa na katumbas ng :date.',
    'date_format' => 'Ang :attribute ay hindi tugma sa format na :format.',
    'decimal' => 'Ang :attribute ay dapat may :decimal decimal places.',
    'declined' => 'Ang :attribute ay dapat hindi tanggapin.',
    'declined_if' => 'Ang :attribute ay dapat hindi tanggapin kapag ang :other ay :value.',
    'different' => 'Ang :attribute at :other ay dapat magkaiba.',
    'digits' => 'Ang :attribute ay dapat :digits digit.',
    'digits_between' => 'Ang :attribute ay dapat nasa pagitan ng :min at :max digit.',
    'dimensions' => 'Ang :attribute ay may hindi wastong sukat ng larawan.',
    'distinct' => 'Ang field na :attribute ay may duplicate na halaga.',
    'doesnt_end_with' => 'Ang :attribute ay hindi dapat magtapos sa isa sa mga sumusunod: :values.',
    'doesnt_start_with' => 'Ang :attribute ay hindi dapat magsimula sa isa sa mga sumusunod: :values.',
    'email' => 'Ang :attribute ay dapat na wastong email address.',
    'ends_with' => 'Ang :attribute ay dapat magtapos sa isa sa mga sumusunod: :values.',
    'enum' => 'Ang napiling :attribute ay hindi wasto.',
    'exists' => 'Ang napiling :attribute ay hindi wasto.',
    'extensions' => 'Ang :attribute ay dapat may isa sa mga sumusunod na extension: :values.',
    'file' => 'Ang :attribute ay dapat isang file.',
    'filled' => 'Ang field na :attribute ay dapat may halaga.',
    'gt' => [
        'array' => 'Ang :attribute ay dapat may higit sa :value na mga item.',
        'file' => 'Ang :attribute ay dapat higit sa :value kilobytes.',
        'numeric' => 'Ang :attribute ay dapat higit sa :value.',
        'string' => 'Ang :attribute ay dapat higit sa :value na mga karakter.',
    ],
    'gte' => [
        'array' => 'Ang :attribute ay dapat may :value na mga item o higit pa.',
        'file' => 'Ang :attribute ay dapat :value kilobytes o higit pa.',
        'numeric' => 'Ang :attribute ay dapat :value o higit pa.',
        'string' => 'Ang :attribute ay dapat :value na mga karakter o higit pa.',
    ],
    'hex_color' => 'Ang :attribute ay dapat na wastong hexadecimal na kulay.',
    'image' => 'Ang :attribute ay dapat isang larawan.',
    'in' => 'Ang napiling :attribute ay hindi wasto.',
    'in_array' => 'Ang field na :attribute ay hindi umiiral sa :other.',
    'integer' => 'Ang :attribute ay dapat isang integer.',
    'ip' => 'Ang :attribute ay dapat na wastong IP address.',
    'ipv4' => 'Ang :attribute ay dapat na wastong IPv4 address.',
    'ipv6' => 'Ang :attribute ay dapat na wastong IPv6 address.',
    'json' => 'Ang :attribute ay dapat na wastong JSON string.',
    'list' => 'Ang :attribute ay dapat isang listahan.',
    'lowercase' => 'Ang :attribute ay dapat naka-maliit na titik.',
    'lt' => [
        'array' => 'Ang :attribute ay dapat may mababa sa :value na mga item.',
        'file' => 'Ang :attribute ay dapat mababa sa :value kilobytes.',
        'numeric' => 'Ang :attribute ay dapat mababa sa :value.',
        'string' => 'Ang :attribute ay dapat mababa sa :value na mga karakter.',
    ],
    'lte' => [
        'array' => 'Ang :attribute ay hindi dapat magkaroon ng higit sa :value na mga item.',
        'file' => 'Ang :attribute ay dapat :value kilobytes o mababa pa.',
        'numeric' => 'Ang :attribute ay dapat :value o mababa pa.',
        'string' => 'Ang :attribute ay dapat :value na mga karakter o mababa pa.',
    ],
    'mac_address' => 'Ang :attribute ay dapat na wastong MAC address.',
    'max' => [
        'array' => 'Ang :attribute ay hindi dapat magkaroon ng higit sa :max na mga item.',
        'file' => 'Ang :attribute ay hindi dapat higit sa :max kilobytes.',
        'numeric' => 'Ang :attribute ay hindi dapat higit sa :max.',
        'string' => 'Ang :attribute ay hindi dapat higit sa :max na mga karakter.',
    ],
    'max_digits' => 'Ang :attribute ay hindi dapat magkaroon ng higit sa :max na digit.',
    'mimes' => 'Ang :attribute ay dapat isang file ng uri: :values.',
    'mimetypes' => 'Ang :attribute ay dapat isang file ng uri: :values.',
    'min' => [
        'array' => 'Ang :attribute ay dapat may hindi bababa sa :min na mga item.',
        'file' => 'Ang :attribute ay dapat hindi bababa sa :min kilobytes.',
        'numeric' => 'Ang :attribute ay dapat hindi bababa sa :min.',
        'string' => 'Ang :attribute ay dapat hindi bababa sa :min na mga karakter.',
    ],
    'min_digits' => 'Ang :attribute ay dapat may hindi bababa sa :min na digit.',
    'missing' => 'Ang field na :attribute ay dapat nawawala.',
    'missing_if' => 'Ang field na :attribute ay dapat nawawala kapag ang :other ay :value.',
    'missing_unless' => 'Ang field na :attribute ay dapat nawawala maliban kung ang :other ay :value.',
    'missing_with' => 'Ang field na :attribute ay dapat nawawala kapag ang :values ay naroroon.',
    'missing_with_all' => 'Ang field na :attribute ay dapat nawawala kapag ang :values ay naroroon.',
    'multiple_of' => 'Ang :attribute ay dapat multiple ng :value.',
    'not_in' => 'Ang napiling :attribute ay hindi wasto.',
    'not_regex' => 'Ang format ng :attribute ay hindi wasto.',
    'numeric' => 'Ang :attribute ay dapat isang numero.',
    'password' => [
        'letters' => 'Ang :attribute ay dapat maglaman ng hindi bababa sa isang titik.',
        'mixed' => 'Ang :attribute ay dapat maglaman ng hindi bababa sa isang malaki at isang maliit na titik.',
        'numbers' => 'Ang :attribute ay dapat maglaman ng hindi bababa sa isang numero.',
        'symbols' => 'Ang :attribute ay dapat maglaman ng hindi bababa sa isang simbolo.',
        'uncompromised' => 'Ang ibinigay na :attribute ay lumitaw sa isang data leak. Mangyaring pumili ng ibang :attribute.',
    ],
    'present' => 'Ang field na :attribute ay dapat naroroon.',
    'present_if' => 'Ang field na :attribute ay dapat naroroon kapag ang :other ay :value.',
    'present_unless' => 'Ang field na :attribute ay dapat naroroon maliban kung ang :other ay :value.',
    'present_with' => 'Ang field na :attribute ay dapat naroroon kapag ang :values ay naroroon.',
    'present_with_all' => 'Ang field na :attribute ay dapat naroroon kapag ang :values ay naroroon.',
    'prohibited' => 'Ang field na :attribute ay ipinagbabawal.',
    'prohibited_if' => 'Ang field na :attribute ay ipinagbabawal kapag ang :other ay :value.',
    'prohibited_unless' => 'Ang field na :attribute ay ipinagbabawal maliban kung ang :other ay nasa :values.',
    'prohibits' => 'Ang field na :attribute ay nagbabawal sa :other na naroroon.',
    'regex' => 'Ang format ng :attribute ay hindi wasto.',
    'required' => 'Ang field na :attribute ay kinakailangan.',
    'required_array_keys' => 'Ang :attribute ay dapat maglaman ng mga entry para sa: :values.',
    'required_if' => 'Ang field na :attribute ay kinakailangan kapag ang :other ay :value.',
    'required_if_accepted' => 'Ang field na :attribute ay kinakailangan kapag ang :other ay tinanggap.',
    'required_if_declined' => 'Ang field na :attribute ay kinakailangan kapag ang :other ay hindi tinanggap.',
    'required_unless' => 'Ang field na :attribute ay kinakailangan maliban kung ang :other ay nasa :values.',
    'required_with' => 'Ang field na :attribute ay kinakailangan kapag ang :values ay naroroon.',
    'required_with_all' => 'Ang field na :attribute ay kinakailangan kapag ang :values ay naroroon.',
    'required_without' => 'Ang field na :attribute ay kinakailangan kapag ang :values ay wala.',
    'required_without_all' => 'Ang field na :attribute ay kinakailangan kapag wala sa :values ang naroroon.',
    'same' => 'Ang :attribute at :other ay dapat magtugma.',
    'size' => [
        'array' => 'Ang :attribute ay dapat maglaman ng :size na mga item.',
        'file' => 'Ang :attribute ay dapat :size kilobytes.',
        'numeric' => 'Ang :attribute ay dapat :size.',
        'string' => 'Ang :attribute ay dapat :size na mga karakter.',
    ],
    'starts_with' => 'Ang :attribute ay dapat magsimula sa isa sa mga sumusunod: :values.',
    'string' => 'Ang :attribute ay dapat isang string.',
    'timezone' => 'Ang :attribute ay dapat na wastong timezone.',
    'unique' => 'Ang :attribute ay nakuha na.',
    'uploaded' => 'Ang :attribute ay nabigong i-upload.',
    'uppercase' => 'Ang :attribute ay dapat naka-malaking titik.',
    'url' => 'Ang :attribute ay dapat na wastong URL.',
    'ulid' => 'Ang :attribute ay dapat na wastong ULID.',
    'uuid' => 'Ang :attribute ay dapat na wastong UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
