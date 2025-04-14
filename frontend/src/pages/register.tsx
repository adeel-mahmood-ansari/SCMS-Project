import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, RadioGroup, RadioGroupItem, FormLabel, FormControl, FormItem, FormMessage, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'your-design-library'; // replace with your actual component imports
import { Link } from 'react-router-dom';

const userTypes = [
  { value: 'user', label: 'User' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
];

const departments = [
  { id: '1', name: 'HR' },
  { id: '2', name: 'Engineering' },
  { id: '3', name: 'Marketing' },
];

const schema = z.object({
  name: z.string().min(3, "Name should have at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password should be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password should be at least 6 characters"),
  userType: z.enum(['user', 'staff', 'admin'], { errorMap: () => ({ message: "Please select a valid user type" }) }),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  departmentDescription: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Register = () => {
  const [createNewDepartment, setCreateNewDepartment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { handleSubmit, control, formState: { errors }, setValue, watch } = form;

  const userType = watch('userType');
  const showDepartments = userType === 'staff' || userType === 'admin';

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    // Handle form submission logic
    console.log(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md glass animate-fade-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Register to submit and track your complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* User Type Selection */}
            <FormItem className="space-y-3">
              <FormLabel>I want to register as</FormLabel>
              <FormControl>
                <RadioGroup
                  value={watch('userType')}
                  onValueChange={(value) => setValue('userType', value)}
                  className="flex flex-col gap-2"
                >
                  {userTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <FormLabel htmlFor={type.value}>{type.label}</FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              {errors.userType && <FormMessage>{errors.userType.message}</FormMessage>}
            </FormItem>

            {/* Full Name */}
            <FormItem className="space-y-2">
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...form.register('name')} />
              </FormControl>
              {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
            </FormItem>

            {/* Email */}
            <FormItem className="space-y-2">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...form.register('email')} />
              </FormControl>
              {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
            </FormItem>

            {/* Password */}
            <FormItem className="space-y-2">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...form.register('password')} />
              </FormControl>
              {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
            </FormItem>

            {/* Confirm Password */}
            <FormItem className="space-y-2">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...form.register('confirmPassword')} />
              </FormControl>
              {errors.confirmPassword && <FormMessage>{errors.confirmPassword.message}</FormMessage>}
            </FormItem>

            {/* Department Information */}
            {showDepartments && (
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-sm font-medium">Department Information</h3>
                {userType === 'admin' && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setCreateNewDepartment(!createNewDepartment)}>
                    {createNewDepartment ? 'Select Existing' : 'Create New'}
                  </Button>
                )}

                {!createNewDepartment ? (
                  <FormItem className="space-y-2">
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <select {...form.register('departmentId')} className="input">
                        <option value="">Select a department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    {errors.departmentId && <FormMessage>{errors.departmentId.message}</FormMessage>}
                  </FormItem>
                ) : (
                  <>
                    <FormItem className="space-y-2">
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. HR" {...form.register('departmentName')} />
                      </FormControl>
                      {errors.departmentName && <FormMessage>{errors.departmentName.message}</FormMessage>}
                    </FormItem>

                    <FormItem className="space-y-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea placeholder="Brief description" {...form.register('departmentDescription')} className="textarea" />
                      </FormControl>
                      {errors.departmentDescription && <FormMessage>{errors.departmentDescription.message}</FormMessage>}
                    </FormItem>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link to="/login" className="text-primary">Sign in</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
