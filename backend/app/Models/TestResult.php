<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'language_id',
        'level_id',
        'total_score',
        'max_score',
        'vocab_score',
        'grammar_score',
        'reading_score',
        'listening_score',
        'writing_score',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}
