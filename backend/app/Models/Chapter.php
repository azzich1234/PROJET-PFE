<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'title',
        'description',
        'level_id',
        'language_id',
        'instructor_id',
        'pdf_path',
        'video_url',
        'order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
