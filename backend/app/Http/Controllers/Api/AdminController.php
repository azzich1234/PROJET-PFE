<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    // List all users (with optional search & role filter)
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        $counts = [
            'all'        => User::count(),
            'admin'      => User::where('role', 'admin')->count(),
            'instructor' => User::where('role', 'instructor')->count(),
            'learner'    => User::where('role', 'learner')->count(),
        ];

        return response()->json([
            'users'  => $users,
            'counts' => $counts,
        ]);
    }

    // Toggle user active / inactive
    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'User activated.' : 'User deactivated.',
            'user'    => $user,
        ]);
    }

    // Create a new instructor account
    public function addInstructor(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'role'     => 'instructor',
            'is_active'=> true,
        ]);

        return response()->json([
            'message' => 'Instructor created successfully.',
            'user'    => $user,
        ], 201);
    }

    // Update a user (name, email, role)
    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|in:admin,instructor,learner',
        ]);

        $user->update($request->only('name', 'email', 'role'));

        return response()->json([
            'message' => 'User updated successfully.',
            'user'    => $user,
        ]);
    }

    // Delete a user (admins cannot be deleted)
    public function deleteUser(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete an admin user.'], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
