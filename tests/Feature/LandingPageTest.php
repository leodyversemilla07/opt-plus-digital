<?php

test('landing page loads successfully', function () {
    $this->get('/')
        ->assertStatus(200);
});

test('landing page renders home component', function () {
    $this->get('/')
        ->assertInertia(fn ($page) => $page
            ->component('home')
        );
});

test('landing page passes canRegister prop', function () {
    $this->get('/')
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->has('canRegister')
        );
});

test('features page loads successfully', function () {
    $this->get('/features')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('features')
            ->has('canRegister')
        );
});

test('about page loads successfully', function () {
    $this->get('/about')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('about')
            ->has('canRegister')
        );
});

test('design system page loads successfully', function () {
    $this->get('/design-system')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('design-system')
        );
});
