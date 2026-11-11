// components/ui/material/Breadcrumb.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../Breadcrumb";
import type { AppBreadcrumbItem } from "../types";

const meta = {
    title: "UI/Breadcrumb",
    component: Breadcrumb,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    'Neutral breadcrumb exposing the project’s public API. The last item is automatically treated as the current page: it is rendered as plain text and carries aria-current="page". Previous items only become links when they have an href.',
            },
        },
    },
    argTypes: {
        items: {
            table: {
                disable: true,
            },
            description: "Ordered list of the breadcrumb items. Each item holds a label and, optionally, an href.",
        },
    },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: AppBreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/catalog" },
    { label: "UI components", href: "/catalog/ui-components" },
    { label: "Breadcrumb" },
];

export const Default: Story = {
    args: {
        items: defaultItems,
    },
};

export const SingleCurrentPage: Story = {
    args: {
        items: [{ label: "Dashboard" }],
    },
};

export const LastItemWithHrefIsCurrent: Story = {
    args: {
        items: [
            { label: "Home", href: "/" },
            { label: "Settings", href: "/settings" },
        ],
    },
};

export const IntermediateItemWithoutHref: Story = {
    args: {
        items: [
            { label: "Home", href: "/" },
            { label: "Intermediate step" },
            { label: "Confirmation", href: "/confirmation" },
        ],
    },
};

export const LongHierarchy: Story = {
    args: {
        items: [
            { label: "Home", href: "/" },
            { label: "Customer area", href: "/customer-area" },
            { label: "Billing", href: "/customer-area/billing" },
            { label: "Invoices", href: "/customer-area/billing/invoices" },
            {
                label: "Invoice 2026-0042",
                href: "/customer-area/billing/invoices/2026-0042",
            },
            { label: "Payment details" },
        ],
    },
};

export const WithoutLinks: Story = {
    args: {
        items: [{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }, { label: "Final step" }],
    },
};

export const Empty: Story = {
    args: {
        items: [],
    },
};
