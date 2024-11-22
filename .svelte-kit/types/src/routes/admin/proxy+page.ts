// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = async ({ url, params }: Parameters<PageLoad>[0]) => {
	const site = url.searchParams.get('site') ?? '';
	redirect(302, `/admin/users?site=${site}`);
};