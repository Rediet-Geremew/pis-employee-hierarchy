import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { positionApi } from '@/services/api';
import { Position, CreatePositionDto, UpdatePositionDto } from '@/types/position';

interface PositionState {
  positions: Position[];
  tree: Position[];
  loading: boolean;
  error: string | null;
}

const initialState: PositionState = {
  positions: [],
  tree: [],
  loading: false,
  error: null,
};

export const fetchTree = createAsyncThunk('positions/fetchTree', async (_, { rejectWithValue }) => {
  try {
    console.log('🌳 Fetching organization tree...');
    const response = await positionApi.getTree();
    console.log('✅ Tree fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch tree:', error);
    return rejectWithValue(error.detailedMessage || error.message || 'Failed to fetch tree');
  }
});

export const fetchAll = createAsyncThunk('positions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    console.log('📋 Fetching all positions...');
    const response = await positionApi.getAll();
    console.log('✅ Positions fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch positions:', error);
    return rejectWithValue(error.detailedMessage || error.message || 'Failed to fetch positions');
  }
});

export const createPosition = createAsyncThunk(
  'positions/create',
  async (data: CreatePositionDto, { rejectWithValue }) => {
    try {
      console.log('➕ Creating position:', data);
      const response = await positionApi.create(data);
      console.log('✅ Position created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create position:', error);
      return rejectWithValue({
        message: error.detailedMessage || error.message || 'Failed to create position',
        validationErrors: error.validationErrors || []
      });
    }
  }
);

export const updatePosition = createAsyncThunk(
  'positions/update',
  async ({ id, data }: { id: string; data: Partial<UpdatePositionDto> }, { rejectWithValue }) => {
    try {
      console.log('✏️ Updating position:', { id, data });
      const response = await positionApi.update(id, data);
      console.log('✅ Position updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update position:', error);
      return rejectWithValue({
        message: error.detailedMessage || error.message || 'Failed to update position',
        validationErrors: error.validationErrors || []
      });
    }
  }
);

export const deletePosition = createAsyncThunk(
  'positions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting position:', id);
      await positionApi.delete(id);
      console.log('✅ Position deleted successfully:', id);
      return id;
    } catch (error: any) {
      console.error('❌ Failed to delete position:', error);
      return rejectWithValue(error.detailedMessage || error.message || 'Failed to delete position');
    }
  }
);

const positionSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Tree
      .addCase(fetchTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTree.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch tree';
      })
      // Fetch All
      .addCase(fetchAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch positions';
      })
      // Create
      .addCase(createPosition.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.positions.push(action.payload);
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.loading = false;
        const errorPayload = action.payload as any;
        state.error = errorPayload?.message || 'Failed to create position';
      })
      // Update
      .addCase(updatePosition.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.positions.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.positions[index] = action.payload;
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.loading = false;
        const errorPayload = action.payload as any;
        state.error = errorPayload?.message || 'Failed to update position';
      })
      // Delete
      .addCase(deletePosition.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = state.positions.filter(p => p.id !== action.payload);
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete position';
      });
  },
});

export default positionSlice.reducer;