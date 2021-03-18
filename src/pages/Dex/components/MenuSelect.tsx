import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

interface MenuSelectProps {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  items: Array<MenuItem>
  placeholder: string
}

interface MenuItem {
  text: string
}

export default function MenuSelect(props: MenuSelectProps): JSX.Element {
  const { items, placeholder, onClick } = props
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selected, setSelected] = useState<string>(placeholder)

  const itemNames: Array<string> = items.map((item) => item.text)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    // Close the menu
    setAnchorEl(null)
    if (itemNames.includes(event.currentTarget.innerText)) setSelected(event.currentTarget.innerText)
    if (!onClick) return
    onClick(event)
  }

  return (
    <div
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        border: '1px solid #e6ebf2',
        borderTop: '1px solid #e6ebf2 !important',
        borderBottom: '1px solid #e6ebf2 !important',
        borderRight: '1px solid #e6ebf2 !important',
        borderLeft: '0px solid !important',
        borderLeftWidth: '0px',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="primary"
        style={{ color: '#000' }}
      >
        {selected}
      </Button>
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {items.map((item, index) => (
          <MenuItem key={index} onClick={(e) => handleClose(e)}>
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
