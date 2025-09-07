import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { User } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  preselectedUserType?: 'seller' | 'buyer' | null;
}

export function LoginPage({ onLogin, preselectedUserType }: LoginPageProps) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    userType: (preselectedUserType || 'buyer') as 'seller' | 'buyer'
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    userType: (preselectedUserType || 'buyer') as 'seller' | 'buyer'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    onLogin({
      name: loginData.userType === 'seller' ? 'John Smith (Seller)' : 'Jane Doe (Buyer)',
      email: loginData.email,
      company: loginData.userType === 'seller' ? 'PharmaCorp Ltd' : 'MedCorp Industries',
      userType: loginData.userType
    });
    
    toast.success('Successfully logged in!');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.company || !signupData.userType) {
      toast.error('Please fill in all fields');
      return;
    }
    
    onLogin({
      name: signupData.name,
      email: signupData.email,
      company: signupData.company,
      userType: signupData.userType
    });
    
    toast.success('Account created successfully!');
  };

  const handleDemoLogin = (userType: 'seller' | 'buyer') => {
    onLogin({
      name: userType === 'seller' ? 'Demo Seller' : 'Demo Buyer',
      email: `demo-${userType}@rawsphere.com`,
      company: userType === 'seller' ? 'Demo Seller Company Ltd' : 'Demo Buyer Corp',
      userType
    });
    
    toast.success(`Logged in as demo ${userType}!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
            <span className="text-white text-lg sm:text-2xl">✨</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">RawSphere</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">AI-Powered Supply Chain Marketplace</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a</Label>
                    <Select 
                      value={loginData.userType} 
                      onValueChange={(value: 'seller' | 'buyer') => setLoginData(prev => ({ ...prev, userType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer - Looking to purchase materials</SelectItem>
                        <SelectItem value="seller">Seller - Looking to sell surplus materials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                    Sign In as {loginData.userType === 'seller' ? 'Seller' : 'Buyer'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-userType">I am a</Label>
                    <Select 
                      value={signupData.userType} 
                      onValueChange={(value: 'seller' | 'buyer') => setSignupData(prev => ({ ...prev, userType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer - Looking to purchase materials</SelectItem>
                        <SelectItem value="seller">Seller - Looking to sell surplus materials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Enter your company name"
                      value={signupData.company}
                      onChange={(e) => setSignupData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                    Create {signupData.userType === 'seller' ? 'Seller' : 'Buyer'} Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-6 border-t space-y-2">
              <p className="text-sm text-gray-600 text-center mb-3">Quick demo access:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('buyer')}
                >
                  Demo Buyer
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('seller')}
                >
                  Demo Seller
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}