import { getBootstrapStatic } from '@/services/fplService';
import { BootstrapStatic } from '@/types';
import { ArrowRight, Award, Calendar, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const [data, setData] = useState<BootstrapStatic | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const result = await getBootstrapStatic();
      setData(result);
    } catch (error) {
      console.error('Failed to load FPL data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading FPL Arena...</Text>
      </View>
    );
  }

  const activeGameweek = data?.events.find(e => e.is_current) || data?.events.find(e => e.is_next);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>FPL Studio App</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <Users size={24} color="#64748b" />
          </View>
        </View>

        {/* Current Gameweek Card */}
        {activeGameweek && (
          <View style={styles.gwCard}>
            <View style={styles.gwIconBackground}>
              <Award size={120} color="rgba(255,255,255,0.1)" />
            </View>

            <View style={styles.gwBadge}>
              <Calendar size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.gwBadgeText}>
                {activeGameweek.is_current ? 'Current Gameweek' : 'Next Gameweek'}
              </Text>
            </View>

            <Text style={styles.gwTitle}>GW {activeGameweek.id}</Text>
            <Text style={styles.gwDeadline}>Deadline: {new Date(activeGameweek.deadline_time).toLocaleDateString()} {new Date(activeGameweek.deadline_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

            <TouchableOpacity style={styles.gwButton}>
              <Text style={styles.gwButtonText}>View Details</Text>
              <ArrowRight size={16} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Players"
            value={data?.total_players.toLocaleString() || "0"}
            icon={<Users size={20} color="#3b82f6" />}
            color="#eff6ff"
          />
          <StatCard
            title="Top Scorer"
            value={data?.elements.sort((a, b) => b.total_points - a.total_points)[0]?.web_name || "N/A"}
            icon={<TrendingUp size={20} color="#10b981" />}
            color="#ecfdf5"
          />
        </View>

        {/* Informative Section */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Trending Information</Text>
          <Text style={styles.infoText}>
            Welcome to your new FPL Studio mobile experience. This dashboard will eventually show your team's live points, global rank, and upcoming fixtures.
          </Text>
        </View>

        {/* Top Teams - Preview */}
        <View style={styles.teamsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premier League Teams</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ paddingRight: 20 }}>
            {data?.teams.slice(0, 8).map((team) => (
              <TouchableOpacity key={team.id} style={styles.teamCard}>
                <View style={styles.teamIconContainer}>
                  <Text style={styles.teamShortName}>{team.short_name}</Text>
                </View>
                <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrapper, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  headerIconContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gwCard: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  gwIconBackground: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  gwBadge: {
    flexDirection: 'row',
    itemsCenter: 'center',
    marginBottom: 8,
  },
  gwBadgeText: {
    marginLeft: 8,
    color: '#dbeafe',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 10,
  },
  gwTitle: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 4,
  },
  gwDeadline: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  gwButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gwButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  infoText: {
    color: '#475569',
    lineHeight: 22,
    fontSize: 14,
  },
  teamsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  seeAllText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 14,
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  teamCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  teamIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamShortName: {
    fontWeight: '800',
    color: '#1e293b',
    fontSize: 14,
  },
  teamName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
