import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { Button } from './Button'; // For example in footer
import { Input } from './Input'; // For example in content

const meta = {
  title: 'UI/Card',
  component: Card, // Main component
  subcomponents: { CardHeader, CardContent, CardFooter, CardTitle, CardDescription }, // Include subcomponents
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // No specific args for the Card container itself usually
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base story showing structure
export const Default: Story = {
  render: (args) => (
    <Card className="w-[350px]" {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main card content area. You can put anything here.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button className="ml-auto">Deploy</Button> 
      </CardFooter>
    </Card>
  ),
};

export const WithForm: Story = {
  render: (args) => (
    <Card className="w-[350px]" {...args}>
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="name">Name</label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            {/* Add more form fields here */}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleContent: Story = {
  render: (args) => (
    <Card className="w-[350px]" {...args}>
      <CardContent className="p-6"> {/* Add padding back if no header/footer */}
        <p>Just some simple content inside a card.</p>
      </CardContent>
    </Card>
  ),
}; 