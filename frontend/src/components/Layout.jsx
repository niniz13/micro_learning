import { Box, Container } from '@chakra-ui/react'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50" w="100vw">
      <Navbar />
      <Container
        maxW="100%"
        py={8}
        px={4}
        minH="calc(100vh - 64px)"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgGradient: 'linear(to-b, brand.50, transparent)',
          zIndex: -1,
        }}
      >
        <Container maxW="container.xl">
          {children}
        </Container>
      </Container>
    </Box>
  )
}

export default Layout
