<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:mahasiswa,dosen',
            'npm' => 'required_if:role,mahasiswa|nullable|string|unique:users',
            'konsentrasi' => 'required_if:role,mahasiswa|nullable|string'
        ], [
            'required' => 'Field :attribute wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'username.unique' => 'Username sudah terdaftar.',
            'npm.unique' => 'NPM sudah terdaftar.',
            'npm.required_if' => 'NPM wajib diisi untuk mahasiswa.',
            'konsentrasi.required_if' => 'Konsentrasi wajib diisi untuk mahasiswa.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'npm' => $request->npm,
            'konsentrasi' => $request->konsentrasi
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil!',
            'user' => $this->getUserData($user),
            'token' => $token
        ], 201);
    }

    /**
     * Login with username/email and password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string|min:6'
        ], [
            'username.required' => 'Username atau email harus diisi',
            'password.required' => 'Password harus diisi',
            'password.min' => 'Password minimal 6 karakter'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $loginInput = $request->username;
        $field = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (!Auth::attempt([$field => $loginInput, 'password' => $request->password])) {
            return response()->json([
                'success' => false,
                'message' => 'Username/email atau password salah!'
            ], 401);
        }

        $user = Auth::user();

        // Delete old tokens (optional)
        $user->tokens()->delete();

        $token = $user->createToken($user->role . '_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'role' => $user->role, // role langsung diambil dari database
            'user' => $this->getUserData($user),
            'token' => $token
        ]);
    }

    /**
     * Login with username and NPM (without password)
     */
    public function loginWithNpm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string'
        ], [
            'username.required' => 'Username atau email harus diisi',
            'password.required' => 'NPM harus diisi',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $loginInput = $request->username;
        $field = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($field, $loginInput)
            ->where('npm', $request->password)
            ->first();

        if ($user === null) {
            return response()->json([
                'success' => false,
                'message' => 'Username/email atau NPM salah!'
            ], 401);
        }

        // Delete old tokens (optional)
        $user->tokens()->delete();

        $token = $user->createToken($user->role . '_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'role' => $user->role, // role langsung diambil dari database
            'user' => $this->getUserData($user),
            'token' => $token
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Get authenticated user data
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $this->getUserData($request->user())
        ]);
    }

    /**
     * Check username availability
     */
    public function checkUsername($username)
    {
        $exists = User::where('username', $username)->exists();

        return response()->json([
            'exists' => $exists,
            'available' => !$exists
        ]);
    }

    /**
     * Check email availability
     */
    public function checkEmail($email)
    {
        $exists = User::where('email', $email)->exists();

        return response()->json([
            'exists' => $exists,
            'available' => !$exists
        ]);
    }

    /**
     * Check NPM availability
     */
    public function checkNpm($npm)
    {
        $exists = User::where('npm', $npm)->exists();

        return response()->json([
            'exists' => $exists,
            'available' => !$exists
        ]);
    }

    /**
     * Helper method to format user data
     */
    private function getUserData(User $user)
    {
        return [
            'id' => $user->id,
            'nama' => $user->nama,
            'username' => $user->username,
            'email' => $user->email,
            'npm' => $user->npm,
            'role' => $user->role,
            'konsentrasi' => $user->konsentrasi,
            'created_at' => $user->created_at->format('Y-m-d H:i:s')
        ];
    }
}
