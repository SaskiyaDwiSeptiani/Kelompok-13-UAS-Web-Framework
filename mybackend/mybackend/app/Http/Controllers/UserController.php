<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    public function getDosen()
    {
        $dosen = User::where('role', 'dosen')->select('id', 'nama', 'konsentrasi')->get();
        return response()->json([
            'success' => true,
            'dosen' => $dosen
        ]);
    }
}
