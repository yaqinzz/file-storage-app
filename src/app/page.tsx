'use client'
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Home() {
	const files = useQuery(api.file.getFiles)
	const createFile = useMutation(api.file.createFile)
	return (
		<main className='flex min-h-screen flex-col items-center justify-center gap-4'>
			<SignedIn>
				<SignOutButton>
					<Button>Sign Out</Button>
				</SignOutButton>
			</SignedIn>
			<SignedOut>
				<SignInButton mode='modal'>
					<Button>Sign In</Button>
				</SignInButton>
			</SignedOut>
			{files?.map(file => <p key={file._id}>{file.name}</p>)}
			<Button
				onClick={() =>
					createFile({
						name: 'test',
					})
				}>
				Click me
			</Button>
		</main>
	)
}
