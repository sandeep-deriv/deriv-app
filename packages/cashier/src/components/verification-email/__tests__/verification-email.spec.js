import React from 'react';
import { fireEvent, screen, render } from '@testing-library/react';
import VerificationEmail from '../verification-email';

describe('<VerificationEmail />', () => {
    const resendVerificationEmail = jest.fn();
    const setIsResendClicked = jest.fn();

    it('component should be rendered', () => {
        const { container } = render(<VerificationEmail />);

        expect(container.querySelector('.verification-email')).toBeInTheDocument();
        expect(screen.getByText("We've sent you an email.")).toBeInTheDocument();
        expect(
            screen.getByText('Please check your email for the verification link to complete the process.')
        ).toBeInTheDocument();
    });

    it("React.Fragment should be rendered if 'is_resend_clicked' prop is true", () => {
        const { container } = render(<VerificationEmail is_resend_clicked />);

        expect(screen.getByText("Didn't receive the email?")).toBeInTheDocument();
        expect(
            screen.getByText("Check your spam or junk folder. If it's not there, try resending the email.")
        ).toBeInTheDocument();
        expect(container.querySelector('.verification-email__resend-button')).toBeInTheDocument();
    });

    it("resendVerificationEmail func should not be triggered when 'resend_timeout' prop is less than 60", () => {
        const resend_timeout = 59;
        const { container } = render(
            <VerificationEmail
                is_resend_clicked
                resend_timeout={resend_timeout}
                resendVerificationEmail={resendVerificationEmail}
            />
        );

        const btn = container.querySelector('.verification-email__resend-button');
        fireEvent.click(btn);

        expect(resendVerificationEmail).toHaveBeenCalledTimes(0);
    });

    it("resendVerificationEmail func should be triggered when 'resend_timeout' prop is more or equal 60", () => {
        const resend_timeout = 60;
        const { container } = render(
            <VerificationEmail
                is_resend_clicked
                resend_timeout={resend_timeout}
                resendVerificationEmail={resendVerificationEmail}
            />
        );

        const btn = container.querySelector('.verification-email__resend-button');
        fireEvent.click(btn);

        expect(resendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it("button with 'Didn't receive the email?' text should be rendered when 'is_resend_clicked' prop is false", () => {
        render(<VerificationEmail is_resend_clicked={false} />);

        expect(screen.getByRole('button', { name: "Didn't receive the email?" })).toBeInTheDocument();
    });

    it('setIsResendClicked func should be triggered', () => {
        render(<VerificationEmail is_resend_clicked={false} setIsResendClicked={setIsResendClicked} />);

        const btn = screen.getByRole('button', { name: "Didn't receive the email?" });
        fireEvent.click(btn);

        expect(setIsResendClicked).toHaveBeenCalledTimes(1);
    });
});
