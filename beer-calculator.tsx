import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const BeerCalculator = () => {
  const [beers, setBeers] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customSize, setCustomSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [beerBrand, setBeerBrand] = useState('');
  const [sortBy, setSortBy] = useState('added');
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const commonSizes = [250, 350, 473, 600, 1000];

  const popularBeers = [
    "Heineken",
    "Stella Artois",
    "Eisenbahn",
    "Budweiser",
    "Corona",
    "Brahma",
    "Skol",
    "Antarctica",
    "Amstel",
    "Beck's",
    "Bohemia",
    "Colorado",
    "Hoegaarden",
    "Original",
    "Patagonia"
  ];

  // R$ 8,50 por litro = R$ 0,0085 por ml
  const suggestedPricePerMl = 0.0085;

  const filteredBeers = popularBeers.filter(beer =>
    beer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load saved beers from localStorage on component mount
  useEffect(() => {
    try {
      const savedBeers = localStorage.getItem('savedBeers');
      if (savedBeers) {
        const parsedBeers = JSON.parse(savedBeers);
        setBeers(parsedBeers);
      }
    } catch (error) {
      console.error('Error loading saved beers:', error);
    }
  }, []);

  // Save beers to localStorage whenever the beers array changes
  useEffect(() => {
    try {
      if (beers.length > 0) {
        localStorage.setItem('savedBeers', JSON.stringify(beers));
      } else {
        localStorage.removeItem('savedBeers');
      }
    } catch (error) {
      console.error('Error saving beers:', error);
    }
  }, [beers]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.brand-input-container')) {
        setShowBrandSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const formatPrice = (value) => {
    const numbers = value.replace(/\D/g, '');
    const price = (parseInt(numbers) || 0) / 100;
    return price.toFixed(2);
  };

  const handlePriceChange = (value) => {
    setCurrentPrice(formatPrice(value));
  };

  const adjustPrice = (amount) => {
    const currentValue = currentPrice === '' ? 0 : parseFloat(currentPrice);
    setCurrentPrice((currentValue + amount).toFixed(2));
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setIsCustomSize(false);
    setCustomSize('');
    const suggestedPrice = (size * suggestedPricePerMl).toFixed(2);
    setCurrentPrice(suggestedPrice);
  };

  const handleCustomSizeChange = (value) => {
    const numbers = value.replace(/\D/g, '');
    setCustomSize(numbers);
    if (numbers) {
      const size = parseInt(numbers);
      setSelectedSize(size);
      const suggestedPrice = (size * suggestedPricePerMl).toFixed(2);
      setCurrentPrice(suggestedPrice);
    }
  };

  const handleBrandChange = (value) => {
    setBeerBrand(value);
    setSearchTerm(value);
    setShowBrandSuggestions(true);
  };

  const selectBrand = (brand) => {
    setBeerBrand(brand);
    setSearchTerm('');
    setShowBrandSuggestions(false);
  };

  const addBeer = () => {
    if (!selectedSize || !currentPrice) return;
    
    const newBeer = {
      id: Date.now(),
      size: selectedSize,
      price: parseFloat(currentPrice),
      pricePerMl: parseFloat(currentPrice) / selectedSize,
      brand: beerBrand.trim(),
      addedAt: Date.now()
    };
    
    setBeers([...beers, newBeer]);
    setSelectedSize(null);
    setCurrentPrice('');
    setBeerBrand('');
    setIsCustomSize(false);
    setCustomSize('');
  };

  const removeBeer = (id) => {
    setBeers(beers.filter(beer => beer.id !== id));
  };

  const clearAllBeers = () => {
    setBeers([]);
  };

  const getBestDeal = () => {
    if (beers.length < 2) return null;
    return beers.reduce((prev, current) => 
      prev.pricePerMl < current.pricePerMl ? prev : current
    );
  };

  const getSortedBeers = () => {
    if (sortBy === 'price') {
      return [...beers].sort((a, b) => a.pricePerMl - b.pricePerMl);
    }
    return [...beers].sort((a, b) => a.addedAt - b.addedAt);
  };

  const bestDeal = getBestDeal();
  const sortedBeers = getSortedBeers();

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Calculadora de Preço de Cerveja
            {beers.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={clearAllBeers}
              >
                Limpar Tudo
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tamanhos */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Tamanho (ml):</label>
            <div className="flex flex-wrap gap-2">
              {commonSizes.map(size => (
                <Button
                  key={size}
                  variant={selectedSize === size && !isCustomSize ? "default" : "outline"}
                  onClick={() => handleSizeSelect(size)}
                  className="w-20"
                >
                  {size}ml
                </Button>
              ))}
              <Button
                variant={isCustomSize ? "default" : "outline"}
                onClick={() => {
                  setIsCustomSize(true);
                  setSelectedSize(null);
                }}
                className="w-auto"
              >
                Personalizado
              </Button>
            </div>
            {isCustomSize && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customSize}
                  onChange={(e) => handleCustomSizeChange(e.target.value)}
                  className="w-full p-2 border rounded text-center"
                  inputMode="numeric"
                  placeholder="Digite o tamanho em ml"
                />
              </div>
            )}
          </div>

          {/* Marca (opcional) com Autocomplete */}
          <div className="space-y-2 brand-input-container relative">
            <label className="block text-sm font-medium">
              Marca (opcional):
            </label>
            <div className="relative">
              <input
                type="text"
                value={beerBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                onClick={() => setShowBrandSuggestions(true)}
                className="w-full p-2 pr-8 border rounded"
                placeholder="Digite ou selecione a marca da cerveja"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowBrandSuggestions(!showBrandSuggestions)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            {showBrandSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                {filteredBeers.length > 0 ? (
                  filteredBeers.map((beer, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => selectBrand(beer)}
                    >
                      {beer}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    Nenhuma marca encontrada
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Preço (R$):</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustPrice(-0.01)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="text"
                value={currentPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="flex-1 p-2 border rounded text-center"
                inputMode="numeric"
                placeholder="0,00"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustPrice(0.01)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Botão Adicionar */}
          <Button 
            onClick={addBeer}
            className="w-full"
            disabled={!selectedSize || !currentPrice}
          >
            Adicionar Cerveja
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Cervejas */}
      {beers.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Opções de ordenação */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'added' ? 'price' : 'added')}
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortBy === 'added' ? 'Ordenar por preço' : 'Ordenar por adição'}
              </Button>
            </div>

            <div className="space-y-2">
              {sortedBeers.map(beer => (
                <div 
                  key={beer.id} 
                  className={`flex flex-col p-2 rounded ${
                    bestDeal && beer.id === bestDeal.id ? 'bg-green-100 dark:bg-green-900' : 'bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {beer.brand && (
                        <span className="text-sm font-medium">{beer.brand}</span>
                      )}
                      <span>{beer.size}ml - R$ {beer.price.toFixed(2)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      (R$ {(beer.pricePerMl * 1000).toFixed(2)}/L)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBeer(beer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Melhor Custo-Benefício */}
      {bestDeal && (
        <Alert className="bg-green-100 dark:bg-green-900">
          <AlertTitle>Melhor Custo-Benefício:</AlertTitle>
          <AlertDescription>
            {bestDeal.brand && <div className="font-medium">{bestDeal.brand}</div>}
            A cerveja de {bestDeal.size}ml por R$ {bestDeal.price.toFixed(2)} 
            (R$ {(bestDeal.pricePerMl * 1000).toFixed(2)}/L)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BeerCalculator;
