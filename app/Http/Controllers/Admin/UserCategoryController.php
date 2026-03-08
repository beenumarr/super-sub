<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserCategory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class UserCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required','string','max:255','unique:user_categories,name'],
        ]);

        $category = UserCategory::create(['name' => $validated['name']]);

        return Redirect::back()->with('success', 'Category created.')->with('created_category_id', $category->id);
    }

    public function bulkAssign(Request $request): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'user_ids' => ['required','array'],
            'user_ids.*' => ['integer','exists:users,id'],
            'category_id' => ['nullable','integer','exists:user_categories,id'],
            'new_category_name' => ['nullable','string','max:255'],
        ]);

        $categoryId = $validated['category_id'] ?? null;
        if (!$categoryId && !empty($validated['new_category_name'])) {
            $categoryId = UserCategory::firstOrCreate(['name' => $validated['new_category_name']])->id;
        }

        User::whereIn('id', $validated['user_ids'])->update(['user_category_id' => $categoryId]);

        return Redirect::back()->with('success', 'Users moved to category.');
    }
}


