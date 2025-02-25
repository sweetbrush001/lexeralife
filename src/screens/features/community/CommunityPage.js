import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Image, ActivityIndicator, RefreshControl, StatusBar, TextInput, Share } from 'react-native'; 
import { collection,  arrayRemove , doc, getDoc, updateDoc, arrayUnion, increment, deleteDoc, onSnapshot } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, auth } from '../../../config/firebaseConfig';  // Firebase config with auth



const CommunityPage = ({ navigation }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [commentTexts, setCommentTexts] = useState({});
    const [expandedPostId, setExpandedPostId] = useState(null); // Track expanded post
    const [replyToCommentId, setReplyToCommentId] = useState(null); // Track reply to comment

    const insets = useSafeAreaInsets();

    const fetchPosts = useCallback(() => {
        setLoading(true);
        const postsQuery = collection(db, 'communityPosts');
        onSnapshot(postsQuery, (querySnapshot) => {
            const postsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                likes: doc.data().likes || 0,
                comments: doc.data().comments || []
            }));
            setPosts(postsList);
            setLoading(false);
            setRefreshing(false); // Stop refreshing after data is loaded
        });
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPosts();
    }, [fetchPosts]);

    const handleLike = useCallback(async (postId) => {
        const postRef = doc(db, 'communityPosts', postId);
        const userEmail = auth.currentUser?.email;  // Get the logged-in user's email
      
        try {
          // Fetch the post to check if the user has already liked it
          const postDoc = await getDoc(postRef);
          if (postDoc.exists()) {
            const postData = postDoc.data();
            const likedUsers = postData.likedUsers || [];
      
            if (likedUsers.includes(userEmail)) {
              // User has already liked the post, so unlike it
              await updateDoc(postRef, {
                likes: increment(-1), // Decrease the likes count
                likedUsers: arrayRemove(userEmail) // Remove user from likedUsers
              });
            } else {
              // User has not liked the post, so like it
              await updateDoc(postRef, {
                likes: increment(1), // Increase the likes count
                likedUsers: arrayUnion(userEmail) // Add user to likedUsers
              });
            }
          }
        } catch (error) {
          console.error('Error updating like:', error);
        }
      }, []);

    const handleComment = async (postId, commentText, replyTo = null) => {
        const postRef = doc(db, 'communityPosts', postId);
        try {
            await updateDoc(postRef, {
                comments: arrayUnion({ text: commentText, author: auth.currentUser.email, timestamp: new Date(), likes: 0, replies: [], replyTo: replyTo })
            });
            setCommentTexts(prev => ({ ...prev, [postId]: '' })); // Clear input after comment
            setReplyToCommentId(null);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleCommentLike = async (postId, commentIndex) => {
        const postRef = doc(db, 'communityPosts', postId);
        const userEmail = auth.currentUser?.email;  // Get the logged-in user's email
    
        try {
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                const comments = [...postDoc.data().comments];
                const comment = comments[commentIndex];
                const likedUsers = comment.likedUsers || [];
    
                if (likedUsers.includes(userEmail)) {
                    // User has already liked the comment, so unlike it
                    comments[commentIndex].likes = comment.likes - 1;
                    comments[commentIndex].likedUsers = arrayRemove(userEmail);  // Remove user from likedUsers
                } else {
                    // User has not liked the comment, so like it
                    comments[commentIndex].likes = (comment.likes || 0) + 1;
                    comments[commentIndex].likedUsers = arrayUnion(userEmail);  // Add user to likedUsers
                }
    
                await updateDoc(postRef, { comments: comments });
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const deletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, 'communityPosts', postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleShare = async (post) => {
        try {
            const postLink = `https://your-app.com/posts/${post.id}`;
            await Share.share({
                message: `Check out this post: ${postLink}`
            });
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    const filteredPosts = searchQuery
        ? posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : posts;

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderComment = (comment, postId, commentIndex) => (
        <View style={styles.commentItem} key={commentIndex}>
            <Text style={styles.commentAuthor}>{comment.author}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
            <View style={styles.commentActions}>
                <TouchableOpacity style={styles.commentAction} onPress={() => handleCommentLike(postId, commentIndex)}>
                    <Icon name="thumbs-up" size={14} color="#0066FF" />
                    <Text style={styles.commentActionText}>Like ({comment.likes || 0})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentAction} onPress={() => setReplyToCommentId(commentIndex)}>
                    <Icon name="reply" size={14} color="#0066FF" />
                    <Text style={styles.commentActionText}>Reply</Text>
                </TouchableOpacity>
            </View>
            {replyToCommentId === commentIndex && (
                <View style={styles.replyInputContainer}>
                    <TextInput
                        style={styles.replyInput}
                        placeholder="Reply to comment..."
                        value={commentTexts[postId] || ''}
                        onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [postId]: text }))}
                    />
                    <TouchableOpacity style={styles.replyButton} onPress={() => handleComment(postId, commentTexts[postId], commentIndex)}>
                        <Text style={styles.replyButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            )}
            {comment.replies && comment.replies.map((reply, replyIndex) => renderComment(reply, postId, replyIndex))}
        </View>
    );

    const renderItem = ({ item }) => {
        const userEmail = auth.currentUser?.email;
        const isPostOwner = userEmail === item.author;
        const isExpanded = expandedPostId === item.id;

        return (
            <View style={styles.postCard}>
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: item.avatar || 'https://placeimg.com/80/80/people' }}
                        style={styles.avatar}
                    />
                    <View style={styles.authorInfo}>
                        <Text style={styles.postAuthor}>{item.author}</Text>
                        <Text style={styles.postTimestamp}>{formatTimestamp(item.timestamp)}</Text>
                    </View>
                    {isPostOwner && (
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deletePost(item.id)}>
                            <Icon name="trash" size={16} color="red" />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postContent} numberOfLines={isExpanded ? undefined : 3}>
                    {item.content}
                </Text>

                {item.imageUrl && (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.interactionStats}>
                    <Text style={styles.statsText}>
                        <Icon name="thumbs-up" size={12} color="#666" /> {item.likes}
                    </Text>
                    <Text style={styles.statsText}>
                        <Icon name="comment" size={12} color="#6666" /> {item.comments?.length || 0}
                    </Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.postFooter}>
                    <TouchableOpacity
                        style={styles.interactionButton}
                        onPress={() => handleLike(item.id)}
                    >
                        <Icon name="thumbs-up" size={16} color={item.likedUsers?.includes(auth.currentUser?.email) ? 'blue' : '#0066FF'} />
                        <Text style={styles.interactionText}>
                                {item.likedUsers?.includes(auth.currentUser?.email) ? 'Unlike' : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.interactionButton}
                        onPress={() => setExpandedPostId(isExpanded ? null : item.id)}
                    >
                        <Icon name="comment" size={16} color="#0066FF" />
                        <Text style={styles.interactionText}>Comment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.interactionButton}
                        onPress={() => handleShare(item)}
                    >
                        <Icon name="share" size={16} color="#0066FF" />
                        <Text style={styles.interactionText}>Share</Text>
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {item.comments && item.comments.map((comment, index) => renderComment(comment, item.id, index))}
                        <View style={styles.commentSection}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment"
                                value={commentTexts[item.id] || ''}
                                onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [item.id]: text }))}
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={() => handleComment(item.id, commentTexts[item.id])}>
                                <Text style={styles.sendButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Community</Text>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search" size={16} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="times" size={16} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0066FF" />
                    <Text style={styles.loaderText}>Loading posts...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#0066FF']}
                            tintColor="#0066FF"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="comment-slash" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No posts match your search' : 'No posts yet'}
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => (searchQuery ? setSearchQuery('') : navigation.navigate('CreatePost'))}
                            >
                                <Text style={styles.emptyButtonText}>
                                    {searchQuery ? 'Clear Search' : 'Create the first post'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Icon name="pen" size={20} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Add your existing styles here
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#333',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    authorInfo: {
        flex: 1,
    },
    postAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    postTimestamp: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    moreButton: {
        padding: 4,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
        color: '#333',
    },
    postContent: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 12,
    },
    interactionStats: {
        flexDirection: 'row',
        marginTop: 12,
    },
    statsText: {
        fontSize: 14,
        color: '#666',
        marginRight: 16,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    interactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    interactionText: {
        fontSize: 14,
        color: '#0066FF',
        marginLeft: 6,
        fontWeight: '500',
    },
    loaderContainer: {
        flex: 1,
        justifycontent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    emptyButton: {
        backgroundColor: '#0066FF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0066FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#f1f1f1',
        borderRadius: 50,
    },
    commentSection: {
        marginTop: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 10,
        fontSize: 14,
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: '#0066FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    expandedContent: {
        marginTop: 10,
    },
    commentItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    commentAuthor: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 4,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    commentActionText: {
        fontSize: 12,
        color: '#0066FF',
        marginLeft: 4,
    },
    replyInputContainer: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
    },
    replyInput: {
        flex: 1,
        height: 30,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 15,
        paddingLeft: 8,
        fontSize: 12,
        marginRight: 8,
    },
    replyButton: {
        backgroundColor: '#0066FF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    replyButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    }
});

export default CommunityPage;