'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Search, 
  Plus, 
  Clock, 
  ChefHat,
  RefreshCw,
  AlertCircle,
  Filter
} from 'lucide-react'
import { useConfigStore } from '@/lib/stores/config-store'
import { Recipe } from '@/lib/types/api'
import { cn } from '@/lib/utils'
import { RecipeCreationModal } from './recipe-creation-modal'

interface RecipeCardProps {
  recipe: Recipe
  onView: (recipe: Recipe) => void
}

function RecipeCard({ recipe, onView }: RecipeCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => onView(recipe)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-medium line-clamp-2">{recipe.nameOfTheRecipe}</h4>
            {recipe.generalDescriptionOfTheRecipe && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {recipe.generalDescriptionOfTheRecipe}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              Recipe
            </div>
            
            {recipe.whenIsItConsumed && recipe.whenIsItConsumed.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {recipe.whenIsItConsumed.slice(0, 2).map((timing, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {timing}
                  </Badge>
                ))}
                {recipe.whenIsItConsumed.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{recipe.whenIsItConsumed.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Version {recipe.version}
            </span>
            <Button size="sm" variant="ghost" className="h-6 text-xs">
              View Recipe
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecipeLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTiming, setFilterTiming] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const { 
    recipes, 
    recipesLoading, 
    recipesError, 
    fetchRecipes,
    clearRecipesError 
  } = useConfigStore()

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const handleRefresh = () => {
    clearRecipesError()
    fetchRecipes()
  }

  const handleCreateRecipe = () => {
    setShowCreateModal(true)
  }

  const handleViewRecipe = (recipe: Recipe) => {
    console.log('View recipe:', recipe.id)
    // TODO: Open recipe details modal or navigate to recipe page
  }

  // Filter recipes based on search and timing
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery === '' || 
      recipe.nameOfTheRecipe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.generalDescriptionOfTheRecipe && 
       recipe.generalDescriptionOfTheRecipe.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesTiming = filterTiming === '' || 
      (recipe.whenIsItConsumed && recipe.whenIsItConsumed.includes(filterTiming))
    
    return matchesSearch && matchesTiming
  })

  // Get unique timings for filter dropdown
  const availableTimings = Array.from(
    new Set(
      recipes.flatMap(recipe => recipe.whenIsItConsumed || [])
    )
  ).sort()

  if (recipesLoading && recipes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 animate-pulse" />
            Recipe Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search bar skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Recipe cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recipe Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {recipesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{recipesError}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterTiming}
            onChange={(e) => setFilterTiming(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All timings</option>
            {availableTimings.map((timing) => (
              <option key={timing} value={timing}>
                {timing}
              </option>
            ))}
          </select>
          
          <Button onClick={handleCreateRecipe}>
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {searchQuery || filterTiming ? (
              <span>
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {filterTiming && ` in ${filterTiming}`}
              </span>
            ) : (
              <span>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} total</span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={recipesLoading}
          >
            <RefreshCw className={cn("h-4 w-4", recipesLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={handleViewRecipe}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            {searchQuery || filterTiming ? (
              <>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-medium">No recipes found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      setFilterTiming('')
                    }}
                  >
                    Clear filters
                  </Button>
                  <Button onClick={handleCreateRecipe}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </Button>
                </div>
              </>
            ) : (
              <>
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-medium">No recipes yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Start building your recipe collection. Each recipe can be used to create meals in your weekly planner.
                  </p>
                </div>
                <Button onClick={handleCreateRecipe}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Recipe
                </Button>
              </>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {recipes.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {recipes.length}
                </div>
                <div className="text-muted-foreground">Total Recipes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {availableTimings.length}
                </div>
                <div className="text-muted-foreground">Meal Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {recipes.filter(r => r.whenIsItConsumed?.includes('Breakfast')).length}
                </div>
                <div className="text-muted-foreground">Breakfast</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {recipes.filter(r => r.whenIsItConsumed?.includes('Dinner')).length}
                </div>
                <div className="text-muted-foreground">Dinner</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Recipe Creation Modal */}
      <RecipeCreationModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </Card>
  )
} 