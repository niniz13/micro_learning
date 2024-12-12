import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Progress,
  Button,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

export default function ModuleDetail() {
  const pages = [
    {
      id: 1,
      title: 'Introduction',
      type: 'text',
      content: 'Welcome to the course...',
    },
    {
      id: 2,
      title: 'Basic Concepts',
      type: 'video',
      content: 'https://example.com/video.mp4',
    },
    {
      id: 3,
      title: 'Quiz',
      type: 'quiz',
      content: 'Test your knowledge',
    },
  ]

  return (
    <Container maxW="container.lg">
      <VStack spacing={6} align="stretch">
        <Box
          p={6}
          rounded="xl"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          backdropFilter="blur(10px)"
          backgroundColor="rgba(255, 255, 255, 0.8)"
        >
          <Heading size="lg" mb={4}>
            Introduction to Web Development
          </Heading>
          <Text color="gray.600" mb={4}>
            Learn the basics of HTML, CSS, and JavaScript
          </Text>
          <Progress value={75} colorScheme="brand" rounded="full" mb={2} />
          <Text fontSize="sm" color="gray.500">
            75% Complete
          </Text>
        </Box>

        <Accordion allowToggle>
          {pages.map((page) => (
            <AccordionItem key={page.id}>
              <h2>
                <AccordionButton
                  _expanded={{ bg: 'brand.50', color: 'brand.600' }}
                >
                  <Box flex="1" textAlign="left">
                    {page.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel
                pb={4}
                bg={useColorModeValue('white', 'gray.700')}
                backdropFilter="blur(10px)"
                backgroundColor="rgba(255, 255, 255, 0.8)"
              >
                <Text mb={4}>{page.content}</Text>
                <Button colorScheme="brand" size="sm">
                  {page.type === 'quiz' ? 'Start Quiz' : 'Mark as Complete'}
                </Button>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </Container>
  )
}
