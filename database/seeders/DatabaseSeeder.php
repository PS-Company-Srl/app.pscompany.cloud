<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roleAdmin = Role::firstOrCreate(
            ['name' => Role::NAME_ADMIN],
            ['name' => Role::NAME_ADMIN]
        );
        $roleCustomer = Role::firstOrCreate(
            ['name' => Role::NAME_CUSTOMER],
            ['name' => Role::NAME_CUSTOMER]
        );

        User::factory()->create([
            'name' => 'Paolo Romano',
            'email' => 'paolo.romano@pscompanysrl.com',
            'password' => Hash::make('password'),
            'role_id' => $roleAdmin->id,
        ]);

        User::factory()->create([
            'name' => 'Cliente Demo',
            'email' => 'cliente@example.com',
            'password' => Hash::make('password'),
            'role_id' => $roleCustomer->id,
        ]);
    }
}
