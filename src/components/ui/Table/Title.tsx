const TableTitle = ({title, description}: {title: string, description: string}) => {
  return (
    <div className="flex flex-col">
        <p className="text-lg text-primary font-bold">{title}</p>
        <p className="text-xs">{description}</p>
    </div>
  )
}

export default TableTitle