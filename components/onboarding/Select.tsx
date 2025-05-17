type Props = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = (props: Props) => {
  return (
    <select
      {...props}
      className="w-full h-10 px-[10px] text-[12px] text-[#222] font-lato rounded-[10px] shadow-[0px_4px_6px_rgba(157,150,141,0.12)] border border-transparent"
    />
  )
}

export default Select
