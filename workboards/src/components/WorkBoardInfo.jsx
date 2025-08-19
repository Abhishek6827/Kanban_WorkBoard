import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

const WorkBoardInfo = ({ boardName, boardDescription, onBoardNameChange, onBoardDescriptionChange, onSubmit }) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Input
          value={boardName}
          onChange={(e) => onBoardNameChange(e.target.value)}
          placeholder="Name your Board"
          className="w-full p-2 border rounded bg-gray-100 placeholder-gray-400"
          required
        />
        <Textarea
          value={boardDescription}
          onChange={(e) => onBoardDescriptionChange(e.target.value)}
          placeholder="Board description"
          className="w-full p-2 border rounded bg-gray-100 placeholder-gray-400"
          rows={3}
        />
        <Button 
          onClick={onSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center"
        >
          Next
        </Button>
      </CardContent>
    </Card>
  )
}

export default WorkBoardInfo