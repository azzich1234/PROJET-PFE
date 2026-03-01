<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearnerLevel extends Model
{
    protected $fillable = ['user_id', 'language_id', 'level_id'];

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
