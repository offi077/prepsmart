
import React, { useState } from 'react';
import { useAuth } from '@/app/providers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, CreditCard, LogOut, Book, Target, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UniversalProfileCard from '@/components/universal/UniversalProfileCard';
import { useExamCategorySelection } from '@/hooks/useExamCategorySelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { CompulsoryFormModal } from '@/components/auth/UpdatedAuthModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Edit, Camera } from 'lucide-react';

interface ProfileButtonProps {
  showProfileCard?: boolean;
}

interface UserProfile {
  username: string;
  email: string;
  phone: string;
  examCategory: string;
  customExamCategory?: string;
  targetExam: string;
  customTargetExam?: string;
  preparationStartDate: Date | null;
  state: string;
  avatar?: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ showProfileCard = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { clearSelection } = useExamCategorySelection();
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getProfileRoute = () => {
    switch (user?.role) {
      case 'student':
        return '/student/profile';
      case 'employee':
        return '/employee/profile';
      case 'admin':
        return '/admin/profile';
      case 'mentor':
        return '/mentor/profile';
      case 'super-admin':
        return '/super-admin/profile';
      case 'owner':
        return '/owner/profile';
      default:
        return '/profile';
    }
  };

  const handleChangeExamCategory = () => {
    if (user?.role === 'student') {
      console.log('Clearing exam category selection from profile...');
      clearSelection();
      navigate('/student/exam-categories', { state: { fromProfile: true } });
    }
  };

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);

  const handleEditProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditProfile(true);
  };

  const handleProfileUpdate = (data: any) => {
    if (!userProfile) return;

    // Merge new data with existing profile
    const updatedProfile = {
      ...userProfile,
      ...data
    };

    setUserProfile(updatedProfile);
    setShowEditProfile(false);

    // If exam category changed, we might want to refresh related data
    if (data.examCategory !== userProfile.examCategory) {
      // Optional: trigger reload or navigation
    }
  };

  const handleInstantUpdate = (data: any) => {
    if (!userProfile) return;
    setUserProfile({
      ...userProfile,
      ...data
    });
  };

  const handleViewProfile = () => {
    navigate(getProfileRoute());
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 px-1 sm:px-2">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src={userProfile?.avatar || user?.avatar} alt={user?.name || "User"} className="object-cover" />
              <AvatarFallback className="text-xs sm:text-sm">{getInitials(user?.name || "User")}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">{user?.name || "User"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[350px] p-0 overflow-hidden shadow-2xl border-muted/20" forceMount>
          {/* Professional Profile Summary Card */}
          <div className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b relative overflow-hidden group/header">
            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer shrink-0" onClick={handleEditProfile}>
                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-300">
                    <AvatarImage src={userProfile?.avatar || user?.avatar} alt={user?.name || "User"} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary text-white font-bold">{getInitials(user?.name || "User")}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-lg font-extrabold truncate leading-none text-foreground">{user?.name || "Candidate"}</p>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium mb-2">{user?.email || "aspirant@example.com"}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[10px] uppercase tracking-wider font-bold bg-background/50 hover:bg-primary hover:text-white transition-all border-primary/20"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Status & Goals Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-primary/10">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Target Exam
                  </p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {userProfile?.targetExam?.toUpperCase().replace('-', ' ') || "NOT SET"}
                  </p>
                </div>
                <div className="space-y-1 pl-3 border-l border-primary/10">
                  <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> State
                  </p>
                  <p className="text-sm font-bold text-foreground truncate capitalize">
                    {userProfile?.state || "NOT SET"}
                  </p>
                </div>
              </div>
            </div>
            {/* Elegant design element */}
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
          </div>

          <div className="p-2 space-y-1 bg-background">
            <DropdownMenuItem
              onClick={() => navigate('/student/profile?tab=details')}
              className="h-11 px-4 cursor-pointer rounded-lg hover:bg-primary/5 group"
            >
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
                <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground">Full Account Details</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate('/student/profile?tab=security')}
              className="h-11 px-4 cursor-pointer rounded-lg hover:bg-primary/5 group font-medium"
            >
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mr-3 group-hover:bg-primary/10">
                <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-sm text-foreground/80 group-hover:text-foreground">Security Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="h-11 px-4 cursor-pointer rounded-lg hover:bg-primary/5 group font-medium">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mr-3 group-hover:bg-primary/10">
                <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-sm text-foreground/80 group-hover:text-foreground">Premium Subscription</span>
            </DropdownMenuItem>

            <div className="h-px bg-muted/60 my-2 mx-2" />

            <DropdownMenuItem
              onClick={() => logout?.()}
              className="h-11 px-4 cursor-pointer rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 font-bold transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm">Logout Session</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <CompulsoryFormModal
          open={showEditProfile}
          onOpenChange={setShowEditProfile}
          username={user?.name || ''}
          initialData={userProfile || undefined}
          onInstantUpdate={handleInstantUpdate}
          onComplete={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfileButton;
