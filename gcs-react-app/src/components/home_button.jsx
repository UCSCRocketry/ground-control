import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function HomeButton() {
  return (
    <Button variant="text" startIcon={<HomeIcon />}>
      Home
    </Button>
  );
}
