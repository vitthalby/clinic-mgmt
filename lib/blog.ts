import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { BlogData } from '@/types/cards'

const postsDirectory = path.join(process.cwd(), 'content/blogs')

export function getAllPosts(): BlogData[] {
    // Create directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
        return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".mdx" from file name to get id
        const id = fileName.replace(/\.mdx$/, '')

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents)

        // Combine the data with the id
        return {
            id,
            ...matterResult.data,
        } as BlogData
    })

    // Sort posts by pinned status then date
    return allPostsData.sort((a, b) => {
        // 1. Pinned posts come first
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1

        // 2. Sort by date (newest first)
        if (a.date < b.date) {
            return 1
        } else {
            return -1
        }
    })
}
