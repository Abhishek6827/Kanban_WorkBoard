import React from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

export default function WorkBoardCard({ id, title = 'Untitled Board', description = 'No description', created_at = null, tasks = [] }) {
  return (
    <Link to={`/boards/${id}`} className="block">
      <div className="bg-yellow-200 rounded-lg p-6 h-48 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-gray-500 text-sm">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              T
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}