import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  FileText, 
  Camera,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface VerificationDocument {
  id: string;
  type: 'id_document' | 'business_license' | 'insurance_certificate' | 'portfolio' | 'id_selfie';
  name: string;
  file: File | null;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt?: string;
  rejectionReason?: string;
  isRequired: boolean;
}

const Verification: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturingFor, setCapturingFor] = useState<string | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([
    {
      id: '1',
      type: 'id_document',
      name: 'Government ID',
      file: null,
      status: 'pending',
      isRequired: true
    },
    {
      id: '2',
      type: 'id_selfie',
      name: 'Photo with ID',
      file: null,
      status: 'pending',
      isRequired: true
    },
    {
      id: '3',
      type: 'business_license',
      name: 'Business License',
      file: null,
      status: 'pending',
      isRequired: false
    },
    {
      id: '4',
      type: 'insurance_certificate',
      name: 'Insurance Certificate',
      file: null,
      status: 'pending',
      isRequired: false
    },
    {
      id: '5',
      type: 'portfolio',
      name: 'Portfolio/Work Samples',
      file: null,
      status: 'pending',
      isRequired: false
    }
  ]);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    idNumber: '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    businessName: '',
    businessType: '',
    yearsExperience: '',
    specialties: '',
    bio: ''
  });

  const handleFileUpload = (documentId: string, file: File) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file, uploadedAt: new Date().toISOString() }
          : doc
      )
    );
  };

  const startCamera = async (documentId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setCapturingFor(documentId);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCapturingFor(null);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
    }
  };

  const confirmCapture = () => {
    if (capturedImage && capturingFor) {
      // Convert data URL to File
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `verification_${capturingFor}.jpg`, { type: 'image/jpeg' });
          handleFileUpload(capturingFor, file);
        });
      
      stopCamera();
      toast({
        title: 'Photo captured',
        description: 'Your verification photo has been captured successfully.',
      });
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitVerification = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      const requiredFields = ['fullName', 'idNumber', 'phone', 'address', 'city'];
      const missingFields = requiredFields.filter(field => !personalInfo[field as keyof typeof personalInfo]);
      
      if (missingFields.length > 0) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Check if all documents are uploaded
      const missingDocs = documents.filter(doc => !doc.file);
      if (missingDocs.length > 0) {
        toast({
          title: 'Missing Documents',
          description: 'Please upload all required documents.',
          variant: 'destructive',
        });
        return;
      }

      // Submit verification request
      const verificationData = {
        personalInfo,
        documents: documents.map(doc => ({
          type: doc.type,
          name: doc.name,
          uploadedAt: doc.uploadedAt
        }))
      };

      // This would be a real API call
      // const response = await apiClient.submitVerification(verificationData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Verification Submitted',
        description: 'Your verification request has been submitted for review.',
      });
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} />
            <h1 className="text-2xl font-bold">Verification</h1>
          </div>
          <p className="text-white/90 text-sm">
            Complete your verification to start offering services
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Verification Status */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon('pending')}
                <span className="font-medium">Under Review</span>
              </div>
              <Badge className={`text-xs ${getStatusColor('pending')}`}>
                Pending
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your verification documents are being reviewed. This usually takes 1-2 business days.
            </p>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number *</Label>
                <Input
                  id="idNumber"
                  value={personalInfo.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  placeholder="1234567890123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+27 82 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={personalInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Cape Town"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={personalInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street, Suburb"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={personalInfo.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="8001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years Experience</Label>
                <Input
                  id="yearsExperience"
                  value={personalInfo.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={personalInfo.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="ABC Services"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={personalInfo.businessType}
                onValueChange={(value) => handleInputChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Input
                id="specialties"
                value={personalInfo.specialties}
                onChange={(e) => handleInputChange('specialties', e.target.value)}
                placeholder="Plumbing, Electrical, General Maintenance"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio/Description</Label>
              <Textarea
                id="bio"
                value={personalInfo.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your experience and expertise..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Required Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload the following documents for verification
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {document.type === 'id_selfie' ? <Camera size={16} /> : <FileText size={16} />}
                    <span className="font-medium">{document.name}</span>
                    {document.isRequired && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                    {document.status}
                  </Badge>
                </div>
                
                {document.type === 'id_selfie' ? (
                  <div className="space-y-2">
                    <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                      <Camera size={24} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Take a photo of yourself holding your ID document
                      </p>
                      <Button
                        onClick={() => startCamera(document.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Camera size={16} className="mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    {document.file && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm text-green-700">Photo captured</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      id={`file-${document.id}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(document.id, file);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor={`file-${document.id}`}
                      className="flex items-center gap-2 p-2 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload size={16} />
                      <span className="text-sm">
                        {document.file ? document.file.name : 'Click to upload'}
                      </span>
                    </label>
                    
                    {document.file && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle size={14} />
                        <span>Uploaded successfully</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitVerification}
          disabled={isSubmitting}
          className="w-full bg-gradient-primary"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield size={16} className="mr-2" />
              Submit for Verification
            </>
          )}
        </Button>

        {/* Help Text */}
        <Card className="border-0 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Verification Requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Valid government-issued ID</li>
                  <li>• Business license (if applicable)</li>
                  <li>• Insurance certificate</li>
                  <li>• Portfolio or work samples</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black text-white">
            <h2 className="text-lg font-semibold">Take Verification Photo</h2>
            <Button
              onClick={stopCamera}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            {!capturedImage ? (
              <>
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  ref={(video) => {
                    if (video && cameraStream) {
                      video.srcObject = cameraStream;
                    }
                  }}
                />
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200"
                  >
                    <Camera size={24} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                <img
                  src={capturedImage}
                  alt="Captured verification photo"
                  className="flex-1 object-contain bg-black"
                />
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={confirmCapture}
                    className="bg-primary text-white"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Verification;
