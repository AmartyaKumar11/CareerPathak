import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/stores/profileStore';

// Validation schema
const profileSchema = z.object({
  personalDetails: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    address: z.object({
      street: z.string().min(5, 'Street address must be at least 5 characters'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    }),
  }),
  academicBackground: z.object({
    currentClass: z.string().min(1, 'Current class is required'),
    school: z.string().min(5, 'School/College name must be at least 5 characters'),
    board: z.string().optional(), // Made optional since UG/PG don't have boards
    subjects: z.array(z.string()).min(1, 'Select at least one subject'),
    percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    aspirations: z.array(z.string()).min(1, 'Select at least one aspiration'),
    interestedFields: z.array(z.string()).min(1, 'Select at least one field of interest'),
  }),
  preferences: z.object({
    language: z.enum(['en', 'hi', 'ur', 'ks', 'dg']),
    notifications: z.boolean(),
    theme: z.enum(['light', 'dark', 'system']),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<UserProfile>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const CLASSES = [
  '9th', '10th', '11th', '12th', 'Undergraduate', 'Postgraduate'
];

const BOARDS = [
  'JKBOSE', 'CBSE', 'ICSE', 'Other'
];

const SCHOOL_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English', 'Hindi', 'Urdu', 'History', 'Geography', 'Political Science',
  'Economics', 'Psychology', 'Sociology', 'Philosophy', 'Physical Education',
  'Fine Arts', 'Music', 'Home Science', 'Agriculture'
];

const COLLEGE_SUBJECTS = [
  'Engineering', 'Medicine', 'Business Administration', 'Commerce', 'Law',
  'Journalism', 'Mass Communication', 'Literature', 'Linguistics', 
  'Biotechnology', 'Environmental Science', 'Social Work', 'Education',
  'Architecture', 'Design', 'Hotel Management', 'Tourism', 'Pharmacy',
  'Nursing', 'Physiotherapy', 'Veterinary Science', 'Forestry', 'Agriculture',
  'Computer Science', 'Information Technology', 'Mathematics', 'Statistics',
  'Economics', 'Psychology', 'Political Science', 'History', 'Geography'
];

const ASPIRATIONS = [
  'Engineering', 'Medical', 'Teaching', 'Civil Services', 'Business',
  'Arts & Design', 'Sports', 'Research', 'Social Work', 'Agriculture',
  'Defense', 'Law', 'Journalism', 'Entertainment'
];

const INTERESTED_FIELDS = [
  'Technology', 'Healthcare', 'Education', 'Government', 'Business',
  'Creative Arts', 'Sports', 'Research', 'Social Services', 'Agriculture',
  'Environment', 'Finance', 'Media', 'Tourism', 'Manufacturing'
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'ks', label: 'کٲشُر (Kashmiri)' },
  { value: 'dg', label: 'डोगरी (Dogri)' },
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personalDetails: {
        firstName: initialData?.personalDetails?.firstName || '',
        lastName: initialData?.personalDetails?.lastName || '',
        email: initialData?.personalDetails?.email || '',
        phone: initialData?.personalDetails?.phone || '',
        dateOfBirth: initialData?.personalDetails?.dateOfBirth || '',
        address: {
          street: initialData?.personalDetails?.address?.street || '',
          city: initialData?.personalDetails?.address?.city || '',
          state: initialData?.personalDetails?.address?.state || 'Jammu and Kashmir',
          pincode: initialData?.personalDetails?.address?.pincode || '',
        },
      },
      academicBackground: {
        currentClass: initialData?.academicBackground?.currentClass || '',
        school: initialData?.academicBackground?.school || '',
        board: initialData?.academicBackground?.board || '',
        subjects: initialData?.academicBackground?.subjects || [],
        percentage: initialData?.academicBackground?.percentage || 0,
        aspirations: initialData?.academicBackground?.aspirations || [],
        interestedFields: initialData?.academicBackground?.interestedFields || [],
      },
      preferences: {
        language: initialData?.preferences?.language || 'en',
        notifications: initialData?.preferences?.notifications ?? true,
        theme: initialData?.preferences?.theme || 'system',
      },
    },
  });

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const toggleArrayField = (
    fieldName: 'subjects' | 'aspirations' | 'interestedFields',
    value: string
  ) => {
    const currentValues = form.getValues(`academicBackground.${fieldName}`);
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    form.setValue(`academicBackground.${fieldName}`, newValues);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Your Profile' : 'Edit Profile'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell us about yourself to get personalized career guidance
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your basic personal details for identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="personalDetails.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalDetails.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="personalDetails.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalDetails.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormDescription>
                        10-digit mobile number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="personalDetails.dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Address</h4>
                <FormField
                  control={form.control}
                  name="personalDetails.address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="House number, street name, locality" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="personalDetails.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Srinagar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalDetails.address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/UT</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalDetails.address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="190001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Background</CardTitle>
              <CardDescription>
                Your educational details and academic interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="academicBackground.currentClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Class/Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASSES.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic second field based on education level */}
                {['9th', '10th', '11th', '12th'].includes(form.watch('academicBackground.currentClass')) && (
                  <FormField
                    control={form.control}
                    name="academicBackground.board"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Board</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your board" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BOARDS.map((board) => (
                              <SelectItem key={board} value={board}>
                                {board}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* For UG/PG students, combine university and college into one field */}
                {['Undergraduate', 'Postgraduate'].includes(form.watch('academicBackground.currentClass')) && (
                  <FormField
                    control={form.control}
                    name="academicBackground.board"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University/College</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., University of Kashmir, NIT Srinagar, Government College" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your university or college name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Institution Name - Dynamic based on level */}
              <FormField
                control={form.control}
                name="academicBackground.school"
                render={({ field }) => {
                  const currentClass = form.watch('academicBackground.currentClass');
                  const isHigherEd = ['Undergraduate', 'Postgraduate'].includes(currentClass);
                  
                  return (
                    <FormItem>
                      <FormLabel>
                        {isHigherEd ? 'Course/Program Name' : 'School Name'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            isHigherEd
                              ? "e.g., Bachelor of Engineering, Master of Business Administration"
                              : "e.g., Delhi Public School, Kendriya Vidyalaya"
                          }
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {isHigherEd 
                          ? "Enter your degree/course name"
                          : "Enter your school name"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="academicBackground.percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Performance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder={
                          ['Undergraduate', 'Postgraduate'].includes(form.watch('academicBackground.currentClass'))
                            ? "CGPA (e.g., 8.5) or Percentage (e.g., 85)"
                            : "Percentage (e.g., 85)"
                        }
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {['Undergraduate', 'Postgraduate'].includes(form.watch('academicBackground.currentClass'))
                        ? "Enter CGPA (0-10) or percentage (0-100)"
                        : "Enter percentage (0-100) or equivalent CGPA"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subjects */}
              <FormField
                control={form.control}
                name="academicBackground.subjects"
                render={() => {
                  const currentClass = form.watch('academicBackground.currentClass');
                  const isHigherEd = ['Undergraduate', 'Postgraduate'].includes(currentClass);
                  const availableSubjects = isHigherEd ? COLLEGE_SUBJECTS : SCHOOL_SUBJECTS;
                  
                  return (
                    <FormItem>
                      <FormLabel>
                        {isHigherEd ? 'Subjects/Specializations' : 'Subjects'}
                      </FormLabel>
                      <FormDescription>
                        {isHigherEd 
                          ? 'Select your major subjects or areas of specialization'
                          : 'Select all subjects you are currently studying'
                        }
                      </FormDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableSubjects.map((subject) => {
                          const isSelected = form.watch('academicBackground.subjects').includes(subject);
                          return (
                            <Badge
                              key={subject}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleArrayField('subjects', subject)}
                            >
                              {subject}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Aspirations */}
              <FormField
                control={form.control}
                name="academicBackground.aspirations"
                render={() => (
                  <FormItem>
                    <FormLabel>Career Aspirations</FormLabel>
                    <FormDescription>
                      What career fields are you considering?
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ASPIRATIONS.map((aspiration) => {
                        const isSelected = form.watch('academicBackground.aspirations').includes(aspiration);
                        return (
                          <Badge
                            key={aspiration}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleArrayField('aspirations', aspiration)}
                          >
                            {aspiration}
                          </Badge>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interested Fields */}
              <FormField
                control={form.control}
                name="academicBackground.interestedFields"
                render={() => (
                  <FormItem>
                    <FormLabel>Fields of Interest</FormLabel>
                    <FormDescription>
                      Which industries or sectors interest you most?
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {INTERESTED_FIELDS.map((field) => {
                        const isSelected = form.watch('academicBackground.interestedFields').includes(field);
                        return (
                          <Badge
                            key={field}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleArrayField('interestedFields', field)}
                          >
                            {field}
                          </Badge>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience on CareerPathak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferences.language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferences.notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enable Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive updates about career opportunities, college admissions, and important dates
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Profile' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
