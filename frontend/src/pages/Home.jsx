import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  createIcon,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <Box width="100%">
      <Container maxW="3xl">
        <Stack
          as={Box}
          textAlign="center"
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
          width="100%"
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight="110%"
          >
            Learn at your own pace <br />
            <Text as="span" color="brand.400">
              one step at a time
            </Text>
          </Heading>
          <Text color="gray.500">
            Access bite-sized learning modules designed to help you master new skills
            efficiently. Our platform breaks down complex topics into manageable
            pieces, making learning more accessible and enjoyable.
          </Text>
          <Stack
            direction="column"
            spacing={3}
            align="center"
            alignSelf="center"
            position="relative"
          >
            <Link to="/modules">
              <Button
                colorScheme="brand"
                bg="brand.400"
                rounded="full"
                px={6}
                _hover={{
                  bg: 'brand.500',
                }}
              >
                Get Started
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="link" colorScheme="brand" size="sm">
                Create Free Account
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
