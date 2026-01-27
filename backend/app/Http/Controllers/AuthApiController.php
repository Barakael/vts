<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AuthApiController extends BaseController
{
    public function register(Request $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $role = Role::findByName('Staff', 'web');
            if (! $role) {
                DB::rollBack();
                return $this->sendError('Role not found');
            }

            $user->assignRole($role);

            DB::commit();

            Auth::login($user);

            return $this->sendResponse(['user' => $user], 'User registered successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error registering user', $e->getMessage());
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return $this->sendError('Invalid credentials', [], 422);
        }

        $request->session()->regenerate();

        return $this->sendResponse(['user' => $request->user()], 'User logged in');
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->sendResponse([], 'User logged out');
    }

    public function user(Request $request)
    {
        return $this->sendResponse(['user' => $request->user()], 'Authenticated user');
    }
}