import { useState } from "react";
import { Check, ChevronsUpDown, Edit2, UserCircle, Trophy, Settings, CalendarRange, Image, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import ScoreCardEntry from "./ScoreCardEntry";
import ScoreCardHistory from "./ScoreCardHistory";

// Mock data for user rounds
const mockRounds = [
  { id: 1, date: "2023-06-15", course: "Pine Valley Golf Club", score: 82, par: 70, handicapDifferential: 10.7 },
  { id: 2, date: "2023-06-22", course: "Pebble Beach Golf Links", score: 88, par: 72, handicapDifferential: 14.2 },
  { id: 3, date: "2023-07-05", course: "Torrey Pines Golf Course", score: 85, par: 72, handicapDifferential: 11.6 },
  { id: 4, date: "2023-07-12", course: "Augusta National Golf Club", score: 91, par: 72, handicapDifferential: 16.9 },
  { id: 5, date: "2023-07-28", course: "St Andrews Links", score: 86, par: 72, handicapDifferential: 12.4 },
];

// Mock data for achievements
const mockAchievements = [
  { id: 1, name: "First Birdie", description: "Score your first birdie", date: "2023-01-15", icon: "🐦" },
  { id: 2, name: "Breaking 90", description: "Score under 90 for the first time", date: "2023-05-22", icon: "🏆" },
  { id: 3, name: "5 Rounds Logged", description: "Log 5 rounds in the app", date: "2023-07-28", icon: "📊" },
  { id: 4, name: "Social Butterfly", description: "Connect with 5 friends", date: "2023-08-10", icon: "🦋" },
];

// Component for profile statistics card
const StatsCard = ({ title, value, description }: { title: string; value: string | number; description?: string }) => (
  <Card>
    <CardContent className="p-6">
      <div className="text-center">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="mt-1 text-3xl font-bold">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

// User profile component
const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe",
    username: user?.username || "johndoe",
    email: user?.email || "john.doe@example.com",
    location: "San Francisco, CA",
    bio: "Golf enthusiast with a passion for weekend rounds and improving my short game. I've been playing for 5 years and love connecting with other golfers.",
    handicap: user?.handicap || 12.8,
    yearsPlaying: 5,
    favoriteClub: "7 Iron",
    homeCourse: "Pine Valley Golf Club",
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save profile
  const handleSaveProfile = () => {
    setIsEditing(false);
    // In a real app, this would save the data to the backend
    console.log("Saving profile data:", profileData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left column - Profile summary */}
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar_url || ""} alt={`${profileData.firstName} ${profileData.lastName}`} />
                <AvatarFallback className="text-4xl">
                  {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 space-y-1">
                <h2 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
                <p className="text-muted-foreground">@{profileData.username}</p>
                <div className="flex justify-center gap-1 mt-2">
                  <Badge>Handicap {profileData.handicap}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{profileData.location}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                <div className="text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Rounds</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Friends</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-sm">
                <h3 className="font-medium">About</h3>
                <p className="text-muted-foreground mt-2">{profileData.bio}</p>
              </div>
              
              <div className="mt-6 w-full">
                <Button className="w-full">Edit Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right column - Tabs */}
        <div className="flex-[2]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="stats">Golf Stats</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>
                    {isEditing ? "Edit your profile information" : "View your profile details"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            name="firstName" 
                            value={profileData.firstName} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            name="lastName" 
                            value={profileData.lastName} 
                            onChange={handleInputChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          name="username" 
                          value={profileData.username} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={profileData.email} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          name="location" 
                          value={profileData.location} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          name="bio" 
                          rows={4} 
                          value={profileData.bio} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium">First Name</h4>
                          <p className="text-sm text-muted-foreground">{profileData.firstName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Last Name</h4>
                          <p className="text-sm text-muted-foreground">{profileData.lastName}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Username</h4>
                        <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Email</h4>
                        <p className="text-sm text-muted-foreground">{profileData.email}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Location</h4>
                        <p className="text-sm text-muted-foreground">{profileData.location}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Bio</h4>
                        <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Golf Details</CardTitle>
                  <CardDescription>Your golf information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Handicap</h4>
                      <p className="text-sm text-muted-foreground">{profileData.handicap}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Years Playing</h4>
                      <p className="text-sm text-muted-foreground">{profileData.yearsPlaying}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Favorite Club</h4>
                    <p className="text-sm text-muted-foreground">{profileData.favoriteClub}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Home Course</h4>
                    <p className="text-sm text-muted-foreground">{profileData.homeCourse}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Milestones you've reached in your golf journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAchievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-lg">{achievement.icon}</span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">{achievement.name}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground">Achieved on {achievement.date}</p>
                          </div>
                        </div>
                        {achievement.id !== mockAchievements.length && <Separator className="my-4" />}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Golf Stats Tab */}
            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatsCard title="Current Handicap" value={profileData.handicap} />
                <StatsCard title="Average Score" value={86} description="Last 5 rounds" />
                <StatsCard title="Best Round" value={82} description="Pine Valley GC, June 15" />
              </div>
              
              <div className="flex justify-end mb-6">
                <ScoreCardEntry />
              </div>
              
              <ScoreCardHistory />
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Rounds</CardTitle>
                  <CardDescription>Your last 5 rounds of golf</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {mockRounds.map((round) => (
                      <motion.div 
                        key={round.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: round.id * 0.05 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{round.course}</h4>
                            <p className="text-sm text-muted-foreground">{round.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold">{round.score}</span>
                            <span className="ml-1 text-sm text-muted-foreground">({round.score - round.par > 0 ? "+" : ""}{round.score - round.par})</span>
                            <p className="text-xs text-muted-foreground">Differential: {round.handicapDifferential}</p>
                          </div>
                        </div>
                        {round.id !== mockRounds.length && <Separator className="mt-4" />}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Rounds
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Your golf performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Fairways Hit</span>
                        <span className="text-sm">64%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "64%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Greens in Regulation</span>
                        <span className="text-sm">48%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "48%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Putts per Round</span>
                        <span className="text-sm">32</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "72%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sand Saves</span>
                        <span className="text-sm">28%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "28%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Email Notifications</h4>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-rounds" className="text-sm text-muted-foreground">
                        Round invitations
                      </Label>
                      <Switch id="notify-rounds" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-messages" className="text-sm text-muted-foreground">
                        Messages and comments
                      </Label>
                      <Switch id="notify-messages" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-news" className="text-sm text-muted-foreground">
                        News and updates
                      </Label>
                      <Switch id="notify-news" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Privacy</h4>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="privacy-profile" className="text-sm text-muted-foreground">
                        Public profile
                      </Label>
                      <Switch id="privacy-profile" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="privacy-scores" className="text-sm text-muted-foreground">
                        Show scores to friends only
                      </Label>
                      <Switch id="privacy-scores" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="privacy-location" className="text-sm text-muted-foreground">
                        Show location
                      </Label>
                      <Switch id="privacy-location" defaultChecked />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Display Preferences</h4>
                    <div className="space-y-2">
                      <Label htmlFor="distance-unit" className="text-sm">Distance Units</Label>
                      <Select defaultValue="yards">
                        <SelectTrigger id="distance-unit">
                          <SelectValue placeholder="Select distance unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yards">Yards</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="temperature-unit" className="text-sm">Temperature Units</Label>
                      <Select defaultValue="fahrenheit">
                        <SelectTrigger id="temperature-unit">
                          <SelectValue placeholder="Select temperature unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                          <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Settings</Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Reset Statistics</h4>
                    <p className="text-sm text-muted-foreground">
                      This will remove all your golf rounds and reset your statistics.
                    </p>
                    <Button variant="outline" className="mt-2">Reset Statistics</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all of your data. This action is irreversible.
                    </p>
                    <Button variant="destructive" className="mt-2">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 