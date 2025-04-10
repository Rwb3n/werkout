import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { Label } from './Label'; // Label is often used with Checkbox

// Define the metadata for the Checkbox component stories
const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  // Render the checkbox with a label for context in stories
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Story />
        <Label htmlFor="story-checkbox">Accept terms</Label>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Basic story
export const Default: Story = {
  args: {
    id: 'story-checkbox', // Needed for label association
    checked: false,
    disabled: false,
  },
};

// Checked story
export const Checked: Story = {
  args: {
    id: 'story-checkbox',
    checked: true,
  },
};

// Disabled story
export const Disabled: Story = {
  args: {
    id: 'story-checkbox',
    disabled: true,
  },
};

// Checked and Disabled story
export const CheckedDisabled: Story = {
  args: {
    id: 'story-checkbox',
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" {...args} />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
  args: {
    // Include any specific args for this story if needed
  },
};

export const DisabledWithLabel: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms-disabled" {...args} />
      <Label htmlFor="terms-disabled" className="opacity-50">Accept terms (disabled)</Label>
    </div>
  ),
  args: {
    disabled: true,
  },
}; 