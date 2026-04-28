'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTree, createPosition, updatePosition, deletePosition } from '@/store/positionSlice';
import { Position } from '@/types/position';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Select,
  Badge,
  Loader,
  Box,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconBuilding, IconUsers } from '@tabler/icons-react';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { tree, loading, error } = useAppSelector((state) => state.positions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      parentId: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Name is required' : null),
    },
  });

  useEffect(() => {
    dispatch(fetchTree());
  }, [dispatch]);

  const handleSubmit = async (values: typeof form.values) => {
    const submitData = {
      name: values.name,
      description: values.description,
      parentId: values.parentId === "" ? null : values.parentId
    };

    try {
      if (editingPosition) {
        await dispatch(updatePosition({ id: editingPosition.id, data: submitData }));
        notifications.show({
          title: 'Success',
          message: 'Position updated successfully!',
          color: 'green',
        });
      } else {
        await dispatch(createPosition(submitData));
        notifications.show({
          title: 'Success',
          message: 'Position created successfully!',
          color: 'green',
        });
      }
      dispatch(fetchTree());
      setModalOpen(false);
      form.reset();
      setEditingPosition(null);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save position',
        color: 'red',
      });
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    form.setValues({
      name: position.name,
      description: position.description || '',
      parentId: position.parentId || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this position? Children will be re-parented.')) {
      await dispatch(deletePosition(id));
      dispatch(fetchTree());
      notifications.show({
        title: 'Deleted',
        message: 'Position deleted successfully',
        color: 'yellow',
      });
    }
  };

  const flattenTree = (nodes: Position[]): Position[] => {
    let result: Position[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children && node.children.length) {
        result = result.concat(flattenTree(node.children));
      }
    });
    return result;
  };

  const getTotalPositions = (nodes: Position[]): number => {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.children && node.children.length) {
        count += getTotalPositions(node.children);
      }
    });
    return count;
  };

  const renderTree = (nodes: Position[]) => {
    if (!nodes || nodes.length === 0) return null;
    
    return (
      <Stack gap="md">
        {nodes.map((node) => (
          <Box key={node.id}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              style={{ borderLeftColor: '#8B6914', borderLeftWidth: 4 }}
            >
              <Group justify="space-between" wrap="wrap">
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb="xs" wrap="wrap">
                    <Title order={3}>{node.name}</Title>
                    {!node.parentId && (
                      <Badge color="yellow" variant="light">Head</Badge>
                    )}
                    {node.children && node.children.length > 0 && (
                      <Badge color="brown" variant="light">
                        👥 {node.children.length} Direct {node.children.length === 1 ? 'Report' : 'Reports'}
                      </Badge>
                    )}
                  </Group>
                  {node.description && (
                    <Text size="sm" c="dimmed">{node.description}</Text>
                  )}
                </div>
                <Group gap="xs">
                  <Button 
                    size="xs" 
                    variant="light"
                    color="brown"
                    onClick={() => handleEdit(node)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button 
                    size="xs" 
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(node.id)}
                  >
                    🗑️ Delete
                  </Button>
                </Group>
              </Group>
            </Card>
            {node.children && node.children.length > 0 && (
              <Box style={{ marginLeft: 40, marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #e0ccb3' }}>
                {renderTree(node.children)}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    );
  };

  const totalPositions = getTotalPositions(tree);
  const selectOptions = flattenTree(tree).map(pos => ({
    value: pos.id,
    label: pos.name
  }));

  return (
    <Box style={{ minHeight: '100vh', background: '#faf7f0' }}>
      {/* Header */}
      <Box style={{ background: '#8B6914', color: 'white' }} p="md">
        <Container size="lg">
          <Group justify="space-between" wrap="wrap">
            <div>
              <Title order={1}>🏢 Organization Hierarchy</Title>
              <Text size="sm" opacity={0.9}>Manage employee positions and reporting structure</Text>
            </div>
            <Button 
              variant="filled"
              style={{ background: 'white', color: '#8B6914' }}
              onClick={() => {
                setEditingPosition(null);
                form.reset();
                setModalOpen(true);
              }}
            >
              ➕ Add Position
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="lg" py="xl">
        {/* Stats Cards */}
        {tree.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
            <Paper shadow="xs" p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">Total Positions</Text>
                  <Title order={2}>{totalPositions}</Title>
                </div>
                <IconUsers size={32} color="#8B6914" opacity={0.5} />
              </Group>
            </Paper>
            <Paper shadow="xs" p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">Departments</Text>
                  <Title order={2}>{tree.length}</Title>
                </div>
                <IconBuilding size={32} color="#8B6914" opacity={0.5} />
              </Group>
            </Paper>
            <Paper shadow="xs" p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">Hierarchy Depth</Text>
                  <Title order={2}>Unlimited</Title>
                </div>
                <IconBuilding size={32} color="#8B6914" opacity={0.5} />
              </Group>
            </Paper>
          </SimpleGrid>
        )}

        {/* Error Display */}
        {error && (
          <Paper bg="red.0" p="md" radius="md" mb="lg" style={{ borderLeft: '4px solid red' }}>
            <Text c="red">{error}</Text>
          </Paper>
        )}

        {/* Loading or Tree Display */}
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Loader size="xl" color="brown" />
          </Box>
        ) : (
          <Box>
            {tree.length > 0 ? (
              renderTree(tree)
            ) : (
              <Paper shadow="xs" p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
                <Title order={2} mb="md">🏢</Title>
                <Title order={3} mb="sm">No Positions Yet</Title>
                <Text c="dimmed" mb="lg">Get started by creating your CEO position</Text>
                <Button 
                  color="brown" 
                  onClick={() => setModalOpen(true)}
                >
                  Create CEO
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Container>

      {/* Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPosition(null);
          form.reset();
        }}
        title={editingPosition ? '✏️ Edit Position' : '➕ Add New Position'}
        size="md"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Position Name"
              placeholder="e.g., Chief Technology Officer"
              withAsterisk
              {...form.getInputProps('name')}
            />
            
            <Textarea
              label="Description"
              placeholder="Describe the role and responsibilities..."
              rows={3}
              {...form.getInputProps('description')}
            />
            
            <Select
              label="Reports To"
              placeholder="Select parent position"
              data={selectOptions}
              clearable
              value={form.values.parentId || null}
              onChange={(value) => form.setFieldValue('parentId', value || '')}
              nothingFoundMessage="No positions available"
            />
            <Text size="xs" c="dimmed">
              Leave empty for CEO/root position
            </Text>
            
            <Group justify="flex-end" mt="md">
              <Button 
                variant="light" 
                onClick={() => {
                  setModalOpen(false);
                  setEditingPosition(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="brown">
                {editingPosition ? 'Update Position' : 'Create Position'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}