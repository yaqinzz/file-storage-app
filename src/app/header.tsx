import { Button } from '@/components/ui/button'
import {
	OrganizationSwitcher,
	SignedOut,
	SignInButton,
	UserButton,
} from '@clerk/nextjs'

export const Header = () => {
	return (
		<div className='border-b py-4 bg-gray-50'>
			<div className='container flex items-center justify-between mx-auto'>
				<div>FileDrive</div>
				<div className='flex gap-2'>
					<OrganizationSwitcher />
					<UserButton />
					<SignedOut>
						<SignInButton>
							<Button>Sign in</Button>
						</SignInButton>
					</SignedOut>
				</div>
			</div>
		</div>
	)
}
