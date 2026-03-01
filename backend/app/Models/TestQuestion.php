<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'language_id',
        'instructor_id',
        'category',
        'difficulty',
        'passage',
        'audio_path',
        'question_text',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_option',
        'correct_text',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => 'integer',
        ];
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
