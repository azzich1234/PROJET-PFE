<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Language;
use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChapterController extends Controller
{
    /**
     * List chapters for the authenticated instructor, with optional filters.
     */
    public function index(Request $request)
    {
        $query = Chapter::with(['level:id,name,order', 'language:id,name,code,image'])
            ->where('instructor_id', $request->user()->id);

        if ($request->filled('level_id')) {
            $query->where('level_id', $request->level_id);
        }

        if ($request->filled('language_id')) {
            $query->where('language_id', $request->language_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $chapters = $query->orderBy('language_id')
            ->orderBy('level_id')
            ->orderBy('order')
            ->get();

        $chapters->transform(function ($ch) {
            $ch->pdf_url = $ch->pdf_path ? asset('storage/' . $ch->pdf_path) : null;
            return $ch;
        });

        return response()->json($chapters);
    }

    /**
     * Store a new chapter.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'level_id'    => 'required|exists:levels,id',
            'language_id' => 'required|exists:languages,id',
            'pdf'         => 'nullable|file|mimes:pdf|max:10240',
            'video_url'   => 'nullable|string|max:500',
            'order'       => 'nullable|integer|min:1',
        ]);

        $data = collect($validated)->except('pdf')->toArray();
        $data['instructor_id'] = $request->user()->id;

        // Ensure language is assigned to this instructor
        $lang = Language::find($data['language_id']);
        if (!$lang || $lang->instructor_id !== $request->user()->id) {
            return response()->json(['message' => 'You are not assigned to this language.'], 403);
        }

        if ($request->hasFile('pdf')) {
            $data['pdf_path'] = $request->file('pdf')->store('chapters/pdfs', 'public');
        }

        // Auto-set order if not provided
        if (empty($data['order'])) {
            $maxOrder = Chapter::where('level_id', $data['level_id'])
                ->where('language_id', $data['language_id'])
                ->max('order');
            $data['order'] = ($maxOrder ?? 0) + 1;
        }

        $chapter = Chapter::create($data);
        $chapter->load(['level:id,name,order', 'language:id,name,code,image']);
        $chapter->pdf_url = $chapter->pdf_path ? asset('storage/' . $chapter->pdf_path) : null;

        return response()->json($chapter, 201);
    }

    /**
     * Update a chapter.
     */
    public function update(Request $request, Chapter $chapter)
    {
        // Ensure instructor owns this chapter
        if ($chapter->instructor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'level_id'    => 'required|exists:levels,id',
            'language_id' => 'required|exists:languages,id',
            'pdf'         => 'nullable|file|mimes:pdf|max:10240',
            'video_url'   => 'nullable|string|max:500',
            'order'       => 'nullable|integer|min:1',
        ]);

        $data = collect($validated)->except('pdf')->toArray();

        if ($request->hasFile('pdf')) {
            // Delete old PDF
            if ($chapter->pdf_path) {
                Storage::disk('public')->delete($chapter->pdf_path);
            }
            $data['pdf_path'] = $request->file('pdf')->store('chapters/pdfs', 'public');
        }

        $chapter->update($data);
        $chapter->load(['level:id,name,order', 'language:id,name,code,image']);
        $chapter->pdf_url = $chapter->pdf_path ? asset('storage/' . $chapter->pdf_path) : null;

        return response()->json($chapter);
    }

    /**
     * Delete a chapter.
     */
    public function destroy(Request $request, Chapter $chapter)
    {
        if ($chapter->instructor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($chapter->pdf_path) {
            Storage::disk('public')->delete($chapter->pdf_path);
        }

        $chapter->delete();

        return response()->json(['message' => 'Chapter deleted.']);
    }

    /**
     * Toggle publish status.
     */
    public function togglePublish(Request $request, Chapter $chapter)
    {
        if ($chapter->instructor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $chapter->update(['is_published' => !$chapter->is_published]);
        $chapter->load(['level:id,name,order', 'language:id,name,code,image']);
        $chapter->pdf_url = $chapter->pdf_path ? asset('storage/' . $chapter->pdf_path) : null;

        return response()->json($chapter);
    }

    /**
     * Get levels for a specific language (for instructor dropdowns).
     */
    public function levels(Request $request)
    {
        $request->validate(['language_id' => 'required|exists:languages,id']);

        $levels = Level::where('language_id', $request->language_id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get(['id', 'name', 'order']);

        return response()->json($levels);
    }

    /**
     * Get published chapters for a language, grouped by level (for learners).
     */
    public function learnerChapters(Request $request)
    {
        $request->validate(['language_id' => 'required|exists:languages,id']);

        $levels = Level::where('language_id', $request->language_id)
            ->where('is_active', true)
            ->orderBy('order')
            ->with(['chapters' => function ($q) {
                $q->where('is_published', true)->orderBy('order');
            }])
            ->get(['id', 'name', 'description', 'order']);

        // Append pdf_url to each chapter
        $levels->each(function ($level) {
            $level->chapters->transform(function ($ch) {
                $ch->pdf_url = $ch->pdf_path ? asset('storage/' . $ch->pdf_path) : null;
                return $ch;
            });
        });

        return response()->json($levels);
    }

    /**
     * Get languages assigned to the authenticated instructor.
     */
    public function instructorLanguages(Request $request)
    {
        $languages = Language::where('is_active', true)
            ->where('instructor_id', $request->user()->id)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'image']);

        $languages->transform(function ($lang) {
            $lang->image_url = $lang->image ? asset('storage/' . $lang->image) : null;
            return $lang;
        });

        return response()->json($languages);
    }
}
