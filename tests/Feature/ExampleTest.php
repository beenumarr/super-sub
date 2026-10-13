<?php

it('returns a successful response or redirects to login', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login'));
});
