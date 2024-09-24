'use client'
import { Button } from '@/components/ui/button'
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignOutButton,
	useOrganization,
	useUser,
} from '@clerk/nextjs'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
	title: z.string().min(1).max(200),
	file: z
		.custom<FileList>(val => val instanceof FileList, 'Required')
		.refine(files => files.length > 0, 'Required'),
})

export default function Home() {
	const { toast } = useToast()
	const organization = useOrganization()
	const user = useUser()
	const generateUploadUrl = useMutation(api.files.generateUploadUrl)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			file: undefined,
		},
	})

	const fileRef = form.register('file')

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!orgId) return
		const postUrl = await generateUploadUrl()
		const result = await fetch(postUrl, {
			method: 'POST',
			headers: { 'Content-Type': values.file[0]!.type },
			body: values.file[0],
		})

		const { storageId } = await result.json()
		try {
			await createFile({
				name: values.title,
				fileId: storageId,
				orgId,
			})

			form.reset()
			setIsFileDialogOpen(false)
			toast({
				variant: 'success',
				title: 'File Uploaded',
				description: 'Now everyone can view your file',
			})
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Something went wrong',
				description: 'Your file cloud not be uploaded, Try again later',
			})
		}
	}

	let orgId: string | undefined = undefined
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id
	}

	const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

	const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip')
	const createFile = useMutation(api.files.createFile)
	return (
		<main className='container pt-12'>
			<div className='flex justify-between items-center'>
				<h1 className='text-4xl font-bold'>Your Files</h1>
				<Dialog
					open={isFileDialogOpen}
					onOpenChange={isOpen => {
						setIsFileDialogOpen(isOpen)
						form.reset()
					}}>
					<DialogTrigger asChild>
						<Button onClick={() => {}}>Upload File</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className='mb-8'>Upload your File Here</DialogTitle>
							<DialogDescription>
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className='space-y-8'>
										<FormField
											control={form.control}
											name='title'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Title</FormLabel>
													<FormControl>
														<Input placeholder='shadcn' {...field} />
													</FormControl>
													<FormDescription>
														The title of your file
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='file'
											render={({}) => (
												<FormItem>
													<FormLabel>File</FormLabel>
													<FormControl>
														<Input type='file' {...fileRef} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type='submit'
											disabled={form.formState.isSubmitting}
											className='flex gap-1'>
											{form.formState.isSubmitting && (
												<Loader2 className='w-4 h-4 animate-spin' />
											)}
											Submit
										</Button>
									</form>
								</Form>
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			</div>
			{files?.map(file => {
				return <div key={file._id}>{file.name}</div>
			})}
		</main>
	)
}
