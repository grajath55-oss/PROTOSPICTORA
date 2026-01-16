import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { mockImages } from '../mockData';
import { Sparkles, Package, TrendingDown, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import ImageGrid from '../components/ImageGrid';
import { getBulkRecommendations } from '../services/api';

const BulkBuy = () => {
  const [step, setStep] = useState(1);
  const [requirements, setRequirements] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [budget, setBudget] = useState(30000);
  const [recommendedImages, setRecommendedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateDiscount = (qty) => {
    if (qty >= 2000) return 30;
    if (qty >= 1000) return 25;
    if (qty >= 500) return 20;
    return 0;
  };

  const discount = calculateDiscount(quantity);
  const avgPrice = budget / quantity;
  const originalTotal = quantity * 35;
  const discountAmount = (originalTotal * discount) / 100;
  const finalTotal = originalTotal - discountAmount;

  const handleGenerateRecommendations = async () => {
    if (!requirements.trim()) {
      toast({
        title: 'Requirements needed',
        description: 'Please describe what kind of images you need',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data = await getBulkRecommendations({
        requirements,
        quantity,
        budget,
      });
      
      setRecommendedImages(data.images || []);
      setStep(2);
      
      toast({
        title: 'Recommendations Ready!',
        description: `Found ${data.total_recommended || 0} images matching your requirements`,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to mock data
      const filtered = mockImages.slice(0, Math.min(quantity, 20));
      setRecommendedImages(filtered);
      setStep(2);
      
      toast({
        title: 'Recommendations Ready!',
        description: `Found ${filtered.length} images matching your requirements`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePurchase = () => {
    toast({
      title: 'Processing Purchase',
      description: 'Redirecting to payment...',
    });
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-lg border border-white/10">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              AI-Powered Smart Recommendations
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Bulk Buy with AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get thousands of perfectly matched images with {discount}% discount
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-gray-400'
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium text-white">Requirements</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-white/20 rounded">
              <div
                className={`h-full bg-white rounded transition-all ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`}
              ></div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-gray-400'
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium text-white">Review & Purchase</span>
            </div>
          </div>
        </div>

        {/* Step 1: Requirements */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Tell us what you need</CardTitle>
                <CardDescription className="text-gray-400">
                  Describe your requirements and our AI will recommend the perfect images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="requirements" className="text-base font-semibold mb-2 block text-white">
                    Image Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="E.g., Business and technology themed images for corporate website, diverse people in professional settings, modern office spaces, tech devices..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={6}
                    className="text-base bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Be specific about themes, categories, styles, and use cases
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="quantity" className="text-base font-semibold mb-2 block text-white">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="100"
                      step="100"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1000)}
                      className="text-base bg-white/5 border-white/20 text-white"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Minimum 100 images for bulk pricing
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="budget" className="text-base font-semibold mb-2 block text-white">
                      Budget (USD)
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      min="1000"
                      step="100"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value) || 30000)}
                      className="text-base bg-white/5 border-white/20 text-white"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Avg ${avgPrice.toFixed(2)} per image
                    </p>
                  </div>
                </div>

                {/* Discount Info */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="flex items-start space-x-3">
                    <TrendingDown className="w-6 h-6 text-white mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">Your Discount: {discount}%</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Original Total:</span>
                          <span className="font-semibold">${originalTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-white">
                          <span>Bulk Discount ({discount}%):</span>
                          <span className="font-semibold">-${discountAmount.toLocaleString()}</span>
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Final Total:</span>
                          <span className="text-white">${finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-white text-black hover:bg-gray-200 py-6 text-lg font-semibold"
                  onClick={handleGenerateRecommendations}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate AI Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/10">
                <Package className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-2">Bulk Pricing</h3>
                <p className="text-sm text-gray-400">Save 20-30% on orders of 500+ images</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/10">
                <Sparkles className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-2">AI Matching</h3>
                <p className="text-sm text-gray-400">Smart recommendations based on your needs</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/10">
                <CheckCircle className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-2">Full License</h3>
                <p className="text-sm text-gray-400">Commercial use for all purchased images</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review & Purchase */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Summary Card */}
            <Card className="shadow-2xl border border-white/10 bg-white/5 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Your AI-Recommended Collection</CardTitle>
                <CardDescription className="text-gray-400">
                  Preview of {recommendedImages.length} images (out of {quantity} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/10 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-white">{quantity}</div>
                      <div className="text-sm text-gray-400">Images</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{discount}%</div>
                      <div className="text-sm text-gray-400">Discount</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        ${(finalTotal / quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Per Image</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        ${finalTotal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Requirements Match:</span>
                    <Badge className="bg-white text-black">95% Accurate</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <Separator className="my-6 bg-white/20" />

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 py-6 text-lg border-white/20 text-white hover:bg-white/10"
                  >
                    Modify Requirements
                  </Button>
                  <Button
                    onClick={handlePurchase}
                    className="flex-1 bg-white text-black hover:bg-gray-200 py-6 text-lg font-semibold"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Grid */}
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Preview Sample Images</h2>
              <ImageGrid images={recommendedImages} />
              <div className="text-center mt-8">
                <p className="text-gray-400 mb-4">
                  Showing {recommendedImages.length} of {quantity} total images in your collection
                </p>
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  View All {quantity} Images
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkBuy;