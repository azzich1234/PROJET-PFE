<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LanguageController extends Controller
{
    /**
     * List all languages (with optional search).
     */
    public function index(Request $request)
    {
        $query = Language::with('instructor:id,name,email,avatar');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $languages = $query->orderBy('created_at', 'desc')->get();

        // Append full URL for images
        $languages->transform(function ($lang) {
            if ($lang->image) {
                $lang->image_url = asset('storage/' . $lang->image);
            } else {
                $lang->image_url = null;
            }
            return $lang;
        });

        return response()->json($languages);
    }

    /**
     * Create a new language.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:languages,name',
            'code'          => 'required|string|max:10|unique:languages,code',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'instructor_id' => 'nullable|exists:users,id',
        ]);

        if (!empty($validated['instructor_id'])) {
            $user = User::find($validated['instructor_id']);
            if (!$user || $user->role !== 'instructor') {
                return response()->json(['message' => 'Selected user is not an instructor.'], 422);
            }
        }

        // Handle image upload
        $data = collect($validated)->except('image')->toArray();
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('languages', 'public');
        }

        $language = Language::create($data);

        // Auto-create the 3 default levels for this language
        $levelTemplates = [
            ['name' => 'Beginner',     'description' => 'Start from scratch with the basics.',           'order' => 1],
            ['name' => 'Intermediate', 'description' => 'Build on fundamentals and expand your skills.', 'order' => 2],
            ['name' => 'Advanced',     'description' => 'Master complex topics and achieve fluency.',    'order' => 3],
        ];
        foreach ($levelTemplates as $tpl) {
            $language->levels()->create($tpl);
        }

        $language->load('instructor:id,name,email,avatar');
        $language->image_url = $language->image ? asset('storage/' . $language->image) : null;

        return response()->json($language, 201);
    }

    /**
     * Update a language.
     */
    public function update(Request $request, Language $language)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:languages,name,' . $language->id,
            'code'          => 'required|string|max:10|unique:languages,code,' . $language->id,
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'instructor_id' => 'nullable|exists:users,id',
        ]);

        if (!empty($validated['instructor_id'])) {
            $user = User::find($validated['instructor_id']);
            if (!$user || $user->role !== 'instructor') {
                return response()->json(['message' => 'Selected user is not an instructor.'], 422);
            }
        }

        // Handle image upload
        $data = collect($validated)->except('image')->toArray();
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($language->image) {
                Storage::disk('public')->delete($language->image);
            }
            $data['image'] = $request->file('image')->store('languages', 'public');
        }

        $language->update($data);
        $language->load('instructor:id,name,email,avatar');
        $language->image_url = $language->image ? asset('storage/' . $language->image) : null;

        return response()->json($language);
    }

    /**
     * Delete a language.
     */
    public function destroy(Language $language)
    {
        // Delete image file if exists
        if ($language->image) {
            Storage::disk('public')->delete($language->image);
        }

        $language->delete();

        return response()->json(['message' => 'Language deleted.']);
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Language $language)
    {
        $language->update(['is_active' => !$language->is_active]);
        $language->load('instructor:id,name,email,avatar');
        $language->image_url = $language->image ? asset('storage/' . $language->image) : null;

        return response()->json($language);
    }

    /**
     * Assign an instructor to a language.
     */
    public function assignInstructor(Request $request, Language $language)
    {
        $validated = $request->validate([
            'instructor_id' => 'nullable|exists:users,id',
        ]);

        if (!empty($validated['instructor_id'])) {
            $user = User::find($validated['instructor_id']);
            if (!$user || $user->role !== 'instructor') {
                return response()->json(['message' => 'Selected user is not an instructor.'], 422);
            }
        }

        $language->update(['instructor_id' => $validated['instructor_id'] ?? null]);
        $language->load('instructor:id,name,email,avatar');
        $language->image_url = $language->image ? asset('storage/' . $language->image) : null;

        return response()->json($language);
    }

    /**
     * Get all available instructors (for assignment dropdown).
     */
    public function availableInstructors()
    {
        $instructors = User::where('role', 'instructor')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'avatar')
            ->orderBy('name')
            ->get();

        return response()->json($instructors);
    }

    /**
     * Return only active (published) languages – available to any authenticated user.
     */
    public function activeLanguages()
    {
        $languages = Language::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'image']);

        $languages->transform(function ($lang) {
            $lang->image_url = $lang->image ? asset('storage/' . $lang->image) : null;
            return $lang;
        });

        return response()->json($languages);
    }
}
