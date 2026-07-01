import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteForm } from "@/components/QuoteForm";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("QuoteForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ id: 1 }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a success message after a valid submission", async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone"), "416-555-0100");
    await user.selectOptions(screen.getByLabelText("Service"), "lawn-care-landscaping");
    await user.type(
      screen.getByLabelText("Property address"),
      "123 Main St, Toronto, ON"
    );

    await user.click(screen.getByRole("button", { name: /request free quote/i }));

    await waitFor(() => {
      expect(screen.getByText(/your quote request is in/i)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/leads",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows server-side field errors on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({
          error: "Please fix the highlighted fields.",
          fieldErrors: { email: "Please enter a valid email address" },
        }),
      }))
    );

    const user = userEvent.setup();
    render(<QuoteForm />);

    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone"), "416-555-0100");
    await user.selectOptions(screen.getByLabelText("Service"), "lawn-care-landscaping");
    await user.type(
      screen.getByLabelText("Property address"),
      "123 Main St, Toronto, ON"
    );

    await user.click(screen.getByRole("button", { name: /request free quote/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });
});
