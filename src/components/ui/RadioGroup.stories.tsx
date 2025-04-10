import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { Label } from './Label'; // Label is used with RadioGroup items

// Define the metadata for the RadioGroup component stories
const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for props like defaultValue, disabled, orientation, etc.
    defaultValue: { control: 'text' },
    disabled: { control: 'boolean' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
  },
  // Render RadioGroup with items and labels for context
  decorators: [
    (Story, context) => (
      <Story args={{...context.args, id: 'story-radiogroup'}} />
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Helper function to render items for stories
const renderRadioItems = (idPrefix: string) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <RadioGroupItem value="option1" id={`${idPrefix}-option1`} />
      <Label htmlFor={`${idPrefix}-option1`}>Option 1</Label>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <RadioGroupItem value="option2" id={`${idPrefix}-option2`} />
      <Label htmlFor={`${idPrefix}-option2`}>Option 2</Label>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <RadioGroupItem value="option3" id={`${idPrefix}-option3`} />
      <Label htmlFor={`${idPrefix}-option3`}>Option 3</Label>
    </div>
  </>
);

// Default Vertical Story
export const Default: Story = {
  args: {
    defaultValue: 'option1',
    orientation: 'vertical',
    children: renderRadioItems('default'),
  },
};

// Horizontal Story
export const Horizontal: Story = {
  args: {
    defaultValue: 'option2',
    orientation: 'horizontal',
    children: renderRadioItems('horizontal'),
  },
};

// Disabled Story
export const Disabled: Story = {
  args: {
    defaultValue: 'option1',
    orientation: 'vertical',
    disabled: true,
    children: renderRadioItems('disabled'),
  },
}; 