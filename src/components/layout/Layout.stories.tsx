import type { Meta, StoryObj } from '@storybook/react';
import Layout from './Layout'; // Use default import
import { Container } from './Container'; // Assuming used within Layout

// Define the metadata for the Layout component stories
const meta: Meta<typeof Layout> = {
  title: 'Layout/Layout',
  component: Layout,
  parameters: {
    // Typically, layout components are best viewed in fullscreen mode
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  // Define argTypes if Layout has specific props to control
  // argTypes: { ... },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Basic story showing the layout structure
export const Default: Story = {
  render: (args) => (
    <Layout {...args}>
      <Container>
        <div className="bg-blue-100 p-6 rounded">
          <h1 className="text-xl font-bold mb-2">Main Content Area</h1>
          <p>This is placeholder content inside the main layout area within a container.</p>
        </div>
      </Container>
    </Layout>
  ),
  args: {
    // Add any props Layout might accept, e.g., showHeader, showFooter
  },
};

// Example: Layout without a footer (if applicable)
export const WithoutFooter: Story = {
  render: (args) => (
    <Layout {...args}>
      <Container>
        <div className="bg-green-100 p-6 rounded">
          <h1 className="text-xl font-bold mb-2">Content (No Footer)</h1>
          <p>This layout example demonstrates rendering without the footer section.</p>
        </div>
      </Container>
    </Layout>
  ),
  args: {
    // Assuming a prop like `showFooter={false}` exists
    // showFooter: false,
  },
};

export const WithLongContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2>Page Title</h2>
        <p>Start of the page content.</p>
        {[...Array(20)].map((_, i) => (
          <p key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        ))}
        <p>End of the page content.</p>
      </div>
    ),
  },
}; 