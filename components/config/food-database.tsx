'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Database,
  AlertCircle
} from 'lucide-react'
import { useConfigStore } from '@/lib/stores/config-store'
import { FoodItem } from '@/lib/types/api'
import { FoodItemCreationModal } from './food-item-creation-modal'
import { useClerkApi } from '@/lib/hooks/use-clerk-api'

interface FoodItemCardProps {
  foodItem: FoodItem
  onView: (foodItem: FoodItem) => void
}

function FoodItemCard({ foodItem, onView }: FoodItemCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onView(foodItem)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-base leading-tight">
              {foodItem.name}
            </h3>
            <div className="flex flex-wrap gap-1">
              {foodItem.categoryHierarchy.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          Click to view nutritional details and units
        </div>
      </CardContent>
    </Card>
  )
}

export function FoodDatabase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)
  
  const { 
    foodItems, 
    foodItemsLoading, 
    foodItemsError, 
    fetchFoodItems,
    clearFoodItemsError 
  } = useConfigStore()

  // Initialize Clerk authentication for API calls
  const { isAuthenticated, isLoaded } = useClerkApi()

  useEffect(() => {
    // Only fetch food items when Clerk auth is loaded and user is authenticated
    if (!isLoaded || !isAuthenticated) return
    
    fetchFoodItems()
  }, [fetchFoodItems, isLoaded, isAuthenticated])

  const handleRefresh = () => {
    clearFoodItemsError()
    fetchFoodItems()
  }

  const handleCreateFoodItem = () => {
    setIsCreationModalOpen(true)
  }

  const handleViewFoodItem = (foodItem: FoodItem) => {
    console.log('View food item:', foodItem.id)
    // TODO: Open food item details modal
  }

  // Filter food items based on search
  const filteredFoodItems = foodItems.filter(foodItem => {
    const matchesSearch = searchQuery === '' || 
      foodItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      foodItem.categoryHierarchy.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  if (foodItemsLoading && foodItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Food Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Actions */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreateFoodItem} className="gap-2">
              <Plus className="h-4 w-4" />
              New Food Item
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Error State */}
          {foodItemsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {foodItemsError}{' '}
                <Button variant="link" onClick={handleRefresh} className="p-0 h-auto">
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Food Items Grid */}
      {filteredFoodItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Database className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">
              {searchQuery ? 'No food items found' : 'No food items yet'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or create a new food item.'
                : 'Start building your food database by creating your first food item.'
              }
            </p>
            <Button onClick={handleCreateFoodItem} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Food Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFoodItems.map((foodItem) => (
            <FoodItemCard
              key={foodItem.id}
              foodItem={foodItem}
              onView={handleViewFoodItem}
            />
          ))}
        </div>
      )}

      {/* Loading State for Additional Items */}
      {foodItemsLoading && foodItems.length > 0 && (
        <div className="flex justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Food Item Creation Modal */}
      <FoodItemCreationModal 
        open={isCreationModalOpen}
        onOpenChange={setIsCreationModalOpen}
      />
    </div>
  )
} 