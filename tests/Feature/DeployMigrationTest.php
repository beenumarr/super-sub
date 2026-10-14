<?php

test('deploy migrate route succeeds and runs migrations', function () {
    $response = $this->post('/api/deploy/migrate');

    $response->assertOk();
    $response->assertJsonStructure([
        'status',
        'message',
        'migration_output',
        'storage_output',
        'optimize_output',
        'apis',
    ]);
});
