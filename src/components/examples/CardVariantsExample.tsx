import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Example component demonstrating standard shadcn card components
 */
export const CardVariantsExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Default Card */}
      <Card>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Standard card with basic styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This is the default card component from shadcn/ui.</p>
        </CardContent>
      </Card>

      {/* Card with Button */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Card with interactive elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">This card contains interactive elements.</p>
          <Button size="sm">Click me</Button>
        </CardContent>
      </Card>

      {/* Card with Badge */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Content</CardTitle>
          <CardDescription>Card with badge indicator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">This card shows featured content.</p>
          <Badge variant="secondary">Featured</Badge>
        </CardContent>
      </Card>

      {/* Card with Secondary Button */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Actions</CardTitle>
          <CardDescription>Card with secondary button</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">This card has secondary actions.</p>
          <Button variant="secondary" size="sm">Secondary</Button>
        </CardContent>
      </Card>

      {/* Card with Outline Button */}
      <Card>
        <CardHeader>
          <CardTitle>Outlined Actions</CardTitle>
          <CardDescription>Card with outline button</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">This card has outlined actions.</p>
          <Button variant="outline" size="sm">Outline</Button>
        </CardContent>
      </Card>

      {/* Card with Multiple Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Elements</CardTitle>
          <CardDescription>Card with various shadcn components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">This card demonstrates multiple elements.</p>
          <div className="flex gap-2">
            <Badge variant="outline">Tag 1</Badge>
            <Badge variant="outline">Tag 2</Badge>
          </div>
          <Button size="sm" className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardVariantsExample;