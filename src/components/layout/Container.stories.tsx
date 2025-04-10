import type { Meta, StoryObj } from '@storybook/react';

import { Container } from './Container';

// Define the metadata for the Container component stories
const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Story for the Container component
export const DefaultContainer: Story = {
  args: {
    children: (
      <div className="bg-blue-100 p-4 rounded w-full">
        Content inside a Container.
      </div>
    ),
  },
}; 