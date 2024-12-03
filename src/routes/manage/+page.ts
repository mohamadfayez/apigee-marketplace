import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params }) => {
	const site = url.searchParams.get('site') ?? '';
	redirect(302, `/manage/users?site=${site}`);
};